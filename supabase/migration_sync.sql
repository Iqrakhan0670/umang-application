-- ============================================================
-- UMANG Complete Backend Schema (Supabase / Postgres)
-- Model: Free search + free view.
-- Claim Assistance: One-time Rs.299 fee + 10% success fee on recovery.
-- Synchronized with application code:
--   * unclaimed_records
--   * call_requests
--   * claim_requests
--   * claim_documents
--   * claim_status_history
--   * payment_transactions
--   * create_claim_safe()
-- ============================================================

-- Extensions
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Helper Functions & Admin Definitions
-- ------------------------------------------------------------
create or replace function is_admin()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    auth.jwt() ->> 'email' = 'fybsciqrakhan0670@gmail.com'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or (auth.jwt() ->> 'role') = 'service_role',
    false
  );
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 1. unclaimed_records: Searchable registry of unclaimed assets
-- ------------------------------------------------------------
create table if not exists unclaimed_records (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  middle_name text,
  last_name text,
  folio_number text,
  phone_number text,
  address text,
  state text,
  institution_name text,
  asset_type text,        -- e.g. 'Mutual Fund', 'Bank Deposit', 'Insurance', 'IEPF Shares'
  amount numeric,
  created_at timestamptz default now()
);

-- Trigram index for fuzzy search across full name
create index if not exists idx_records_name_trgm
  on unclaimed_records using gin (
    (coalesce(first_name,'') || ' ' || coalesce(middle_name,'') || ' ' || coalesce(last_name,''))
    gin_trgm_ops
  );

create index if not exists idx_records_folio on unclaimed_records (folio_number);
create index if not exists idx_records_phone on unclaimed_records (phone_number);
create index if not exists idx_records_state on unclaimed_records (state);
create index if not exists idx_records_institution on unclaimed_records (institution_name);

-- Public Search Architecture:
-- Returns ONLY safe, non-identifying fields:
-- id, first_name, last_name, asset_type, amount.
-- Hides: folio_number, phone_number, address, state, institution_name.
drop function if exists fuzzy_search_unclaimed_records(text, double precision) cascade;
drop function if exists fuzzy_search_unclaimed_records(text, float) cascade;
drop function if exists fuzzy_search_unclaimed_records(text) cascade;
drop function if exists fuzzy_search_unclaimed_records cascade;

create or replace function fuzzy_search_unclaimed_records(
  p_search_name text,
  p_threshold float default 0.3
)
returns table (
  id uuid,
  first_name text,
  last_name text,
  asset_type text,
  amount numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    id,
    first_name,
    last_name,
    coalesce(asset_type, 'Unclaimed Asset') as asset_type,
    amount
  from unclaimed_records
  where p_search_name is not null
    and (
      similarity(
        coalesce(first_name,'') || ' ' || coalesce(middle_name,'') || ' ' || coalesce(last_name,''),
        p_search_name
      ) >= p_threshold
      or
      (coalesce(first_name,'') || ' ' || coalesce(last_name,'')) ilike ('%' || trim(p_search_name) || '%')
    )
  order by similarity(
      coalesce(first_name,'') || ' ' || coalesce(middle_name,'') || ' ' || coalesce(last_name,''),
      p_search_name
    ) desc
  limit 50;
$$;

-- Public counter function for Home page
drop function if exists get_total_records_count() cascade;
create or replace function get_total_records_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from unclaimed_records;
$$;

-- Secure Authorized Details Function:
-- Returns exact asset details ONLY when caller is:
-- 1. An Admin, OR
-- 2. An authenticated user who has an active claim or a call request marked 'called'/'closed'.
drop function if exists get_authorized_asset_details(uuid) cascade;
drop function if exists get_authorized_asset_details cascade;
create or replace function get_authorized_asset_details(p_record_id uuid)
returns table (
  id uuid,
  first_name text,
  middle_name text,
  last_name text,
  folio_number text,
  phone_number text,
  address text,
  state text,
  institution_name text,
  asset_type text,
  amount numeric,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_authorized boolean := false;
begin
  v_user_id := auth.uid();

  if is_admin() then
    v_authorized := true;
  elsif v_user_id is not null then
    select exists (
      select 1 from claim_requests
      where record_id = p_record_id
        and user_id = v_user_id
      union
      select 1 from call_requests
      where record_id = p_record_id
        and user_id = v_user_id
        and status in ('called', 'closed')
    ) into v_authorized;
  end if;

  if not v_authorized then
    raise exception 'ACCESS_DENIED: You do not have authorization to view exact details for this record. Request a call or sign in to verify.';
  end if;

  return query
    select
      u.id,
      u.first_name,
      u.middle_name,
      u.last_name,
      u.folio_number,
      u.phone_number,
      u.address,
      u.state,
      u.institution_name,
      u.asset_type,
      u.amount,
      u.created_at
    from unclaimed_records u
    where u.id = p_record_id;
end;
$$;

alter table unclaimed_records enable row level security;

-- Clean up any old public read policies
drop policy if exists "public can read records" on unclaimed_records;
drop policy if exists "Anyone can search and view unclaimed records" on unclaimed_records;
drop policy if exists "Admins can insert unclaimed records" on unclaimed_records;
drop policy if exists "Admins can update unclaimed records" on unclaimed_records;
drop policy if exists "Admins can delete unclaimed records" on unclaimed_records;
drop policy if exists "Admins have full access to unclaimed_records" on unclaimed_records;
drop policy if exists "Authorized users can view exact unclaimed record" on unclaimed_records;

-- Admin full access
create policy "Admins have full access to unclaimed_records"
  on unclaimed_records
  using (is_admin())
  with check (is_admin());

-- Authenticated user can select ONLY records for which they have an authorized relationship
create policy "Authorized users can view exact unclaimed record"
  on unclaimed_records for select
  using (
    auth.uid() is not null
    and (
      exists (
        select 1 from claim_requests cr
        where cr.record_id = unclaimed_records.id
          and cr.user_id = auth.uid()
      )
      or exists (
        select 1 from call_requests cl
        where cl.record_id = unclaimed_records.id
          and cl.user_id = auth.uid()
          and cl.status in ('called', 'closed')
      )
    )
  );


-- ------------------------------------------------------------
-- 2. call_requests: Created from search results ("File claim")
--    Supports guest submissions, admin status triage, and linking
--    upon user login.
-- ------------------------------------------------------------
create table if not exists call_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  record_id uuid references unclaimed_records(id) on delete cascade not null,
  full_name text not null,
  mobile_number text not null,
  email text,
  status text not null default 'requested'
    check (status in ('requested', 'called', 'no_answer', 'closed')),
  verification_token uuid default gen_random_uuid(),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure verification_token exists on older tables
alter table call_requests add column if not exists verification_token uuid default gen_random_uuid();

create index if not exists idx_call_requests_user_id on call_requests (user_id);
create index if not exists idx_call_requests_record_id on call_requests (record_id);
create index if not exists idx_call_requests_status on call_requests (status);
create index if not exists idx_call_requests_created_at on call_requests (created_at desc);
create index if not exists idx_call_requests_token on call_requests (verification_token);

drop trigger if exists trg_call_requests_updated_at on call_requests;
create trigger trg_call_requests_updated_at
  before update on call_requests
  for each row execute function set_updated_at();

-- Safe public status checker for a single call request
drop function if exists get_call_status(uuid) cascade;
create or replace function get_call_status(p_request_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select status from call_requests where id = p_request_id;
$$;

-- Safe public status checker for multiple call requests in localStorage
drop function if exists check_called_requests(uuid[]) cascade;
create or replace function check_called_requests(p_request_ids uuid[])
returns table (
  id uuid,
  status text,
  asset_type text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.status,
    u.asset_type
  from call_requests c
  join unclaimed_records u on u.id = c.record_id
  where c.id = any(p_request_ids);
$$;

-- Secure linking RPC: Cannot be hijacked or abused
drop function if exists link_call_request(uuid, uuid) cascade;
drop function if exists link_call_request cascade;
create or replace function link_call_request(
  p_call_request_id uuid,
  p_verification_token uuid default null
)
returns call_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_email text;
  v_user_phone text;
  v_req call_requests;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED: Must be signed in to link a call request.';
  end if;

  v_user_email := auth.jwt() ->> 'email';
  v_user_phone := auth.jwt() ->> 'phone';

  select * into v_req
  from call_requests
  where id = p_call_request_id;

  if not found then
    raise exception 'REQUEST_NOT_FOUND: Call request does not exist.';
  end if;

  if v_req.user_id = v_user_id then
    return v_req;
  end if;

  if v_req.user_id is not null and v_req.user_id <> v_user_id then
    raise exception 'ALREADY_LINKED: This call request is already linked to another account.';
  end if;

  -- Validate caller has authorization to link:
  -- Token match OR verified auth email match OR verified auth phone match OR admin
  if not (
    is_admin()
    or (p_verification_token is not null and v_req.verification_token = p_verification_token)
    or (v_user_email is not null and v_req.email is not null and lower(v_req.email) = lower(v_user_email))
    or (v_user_phone is not null and v_req.mobile_number = v_user_phone)
  ) then
    raise exception 'UNAUTHORIZED_LINK: You do not have authorization to link this call request.';
  end if;

  update call_requests
  set user_id = v_user_id,
      updated_at = now()
  where id = p_call_request_id
  returning * into v_req;

  return v_req;
end;
$$;

alter table call_requests enable row level security;

drop policy if exists "Anyone can submit a call request" on call_requests;
drop policy if exists "Users and admins can view call requests" on call_requests;
drop policy if exists "Users and admins can update call requests" on call_requests;
drop policy if exists "Admins can update call requests" on call_requests;
drop policy if exists "Admins can delete call requests" on call_requests;

-- 1. Anyone can submit a call request (guests insert user_id = null; users insert own uid)
create policy "Anyone can submit a call request"
  on call_requests for insert
  with check (
    user_id is null or user_id = auth.uid() or is_admin()
  );

-- 2. Authenticated user can view only their own linked requests; admin can view all
create policy "Users and admins can view call requests"
  on call_requests for select
  using (
    (auth.uid() is not null and user_id = auth.uid()) or is_admin()
  );

-- 3. Only admins can update directly (users link securely through link_call_request RPC)
create policy "Admins can update call requests"
  on call_requests for update
  using (is_admin())
  with check (is_admin());

-- 4. Admins can delete
create policy "Admins can delete call requests"
  on call_requests for delete
  using (is_admin());


-- ------------------------------------------------------------
-- 3. claim_requests: Official claims initiated by authenticated users
-- ------------------------------------------------------------
create table if not exists claim_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  record_id uuid references unclaimed_records(id) on delete set null,
  status text not null default 'submitted',
  status_note text,
  assistance_fee_amount numeric default 299,
  assistance_fee_paid boolean default false,
  recovered_amount numeric,
  recovered_at timestamptz,
  success_fee_amount numeric,
  success_fee_paid boolean default false,
  agreement_accepted boolean default false,
  agreement_accepted_at timestamptz,
  documents_required text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure backwards-compatibility with existing tables if upgrading
alter table claim_requests drop constraint if exists claim_requests_status_check;
alter table claim_requests add constraint claim_requests_status_check
  check (status in ('submitted', 'under_review', 'in_review', 'documents_pending', 'filed_with_authority', 'recovered', 'rejected', 'cancelled'));

alter table claim_requests add column if not exists status_note text;
alter table claim_requests add column if not exists recovered_at timestamptz;
alter table claim_requests add column if not exists success_fee_amount numeric;
alter table claim_requests add column if not exists agreement_accepted boolean default false;
alter table claim_requests add column if not exists agreement_accepted_at timestamptz;
alter table claim_requests add column if not exists documents_required text[] default array[]::text[];

-- Enforce one active claim per user per record
create unique index if not exists idx_claim_requests_user_record_active
  on claim_requests (user_id, record_id)
  where status not in ('rejected', 'cancelled');

create index if not exists idx_claims_user on claim_requests (user_id);
create index if not exists idx_claims_record on claim_requests (record_id);
create index if not exists idx_claims_status on claim_requests (status);
create index if not exists idx_claims_created_at on claim_requests (created_at desc);

drop trigger if exists trg_claim_requests_updated_at on claim_requests;
create trigger trg_claim_requests_updated_at
  before update on claim_requests
  for each row execute function set_updated_at();

alter table claim_requests enable row level security;

drop policy if exists "users can view own claims" on claim_requests;
drop policy if exists "Users and admins can view claims" on claim_requests;
create policy "Users and admins can view claims"
  on claim_requests for select
  using (auth.uid() = user_id or is_admin());

drop policy if exists "users can create own claims" on claim_requests;
drop policy if exists "Users and admins can insert claims" on claim_requests;
create policy "Users and admins can insert claims"
  on claim_requests for insert
  with check (auth.uid() = user_id or is_admin());

drop policy if exists "Users and admins can update claims" on claim_requests;
create policy "Users and admins can update claims"
  on claim_requests for update
  using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());

drop policy if exists "Admins can delete claims" on claim_requests;
create policy "Admins can delete claims"
  on claim_requests for delete
  using (is_admin());


-- ------------------------------------------------------------
-- 4. claim_documents: KYC, death certificate, indemnity, bank proof
-- ------------------------------------------------------------
create table if not exists claim_documents (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claim_requests(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  doc_type text not null,
  file_path text not null,
  file_name text not null,
  file_size_bytes bigint,
  uploaded_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists idx_claim_documents_claim_id on claim_documents (claim_id);
create index if not exists idx_claim_documents_user_id on claim_documents (user_id);
create index if not exists idx_claim_documents_uploaded_at on claim_documents (uploaded_at desc);

alter table claim_documents enable row level security;

drop policy if exists "Users and admins can view claim documents" on claim_documents;
create policy "Users and admins can view claim documents"
  on claim_documents for select
  using (auth.uid() = user_id or is_admin());

drop policy if exists "Users and admins can insert claim documents" on claim_documents;
create policy "Users and admins can insert claim documents"
  on claim_documents for insert
  with check (auth.uid() = user_id or is_admin());

drop policy if exists "Users and admins can delete claim documents" on claim_documents;
create policy "Users and admins can delete claim documents"
  on claim_documents for delete
  using (auth.uid() = user_id or is_admin());


-- ------------------------------------------------------------
-- 5. claim_status_history: Audit trail of timeline transitions
-- ------------------------------------------------------------
create table if not exists claim_status_history (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claim_requests(id) on delete cascade not null,
  old_status text,
  new_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text,
  changed_at timestamptz default now()
);

create index if not exists idx_claim_status_history_claim_id on claim_status_history (claim_id);
create index if not exists idx_claim_status_history_changed_at on claim_status_history (changed_at asc);

alter table claim_status_history enable row level security;

drop policy if exists "Users and admins can view claim status history" on claim_status_history;
create policy "Users and admins can view claim status history"
  on claim_status_history for select
  using (
    exists (
      select 1 from claim_requests cr
      where cr.id = claim_status_history.claim_id
        and (cr.user_id = auth.uid() or is_admin())
    )
  );

drop policy if exists "Admins and triggers can insert claim status history" on claim_status_history;
create policy "Admins and triggers can insert claim status history"
  on claim_status_history for insert
  with check (is_admin() or auth.uid() is not null);


-- ------------------------------------------------------------
-- Trigger: Automated Claim Status History Logging
-- ------------------------------------------------------------
create or replace function handle_claim_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    insert into claim_status_history (
      claim_id,
      old_status,
      new_status,
      changed_by,
      note,
      changed_at
    ) values (
      new.id,
      null,
      new.status,
      coalesce(auth.uid(), new.user_id),
      coalesce(new.status_note, 'Claim initiated'),
      now()
    );
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into claim_status_history (
      claim_id,
      old_status,
      new_status,
      changed_by,
      note,
      changed_at
    ) values (
      new.id,
      old.status,
      new.status,
      coalesce(auth.uid(), new.user_id),
      coalesce(new.status_note, 'Status updated to ' || new.status),
      now()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_claim_status_history on claim_requests;
create trigger trg_claim_status_history
  after insert or update on claim_requests
  for each row execute function handle_claim_status_change();


-- ------------------------------------------------------------
-- 6. payment_transactions: Razorpay assistance fee & success fee records
-- ------------------------------------------------------------
create table if not exists payment_transactions (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claim_requests(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  payment_type text not null
    check (payment_type in ('assistance_fee', 'success_fee')),
  amount numeric not null,
  currency text default 'INR',
  gateway text not null default 'razorpay',
  gateway_order_id text,
  gateway_payment_id text,
  gateway_signature text,
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed', 'refunded')),
  failure_reason text,
  attempt_count int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_payment_transactions_claim_id on payment_transactions (claim_id);
create index if not exists idx_payment_transactions_user_id on payment_transactions (user_id);
create index if not exists idx_payment_transactions_gateway_order_id on payment_transactions (gateway_order_id);
create index if not exists idx_payment_transactions_status on payment_transactions (status);

drop trigger if exists trg_payment_transactions_updated_at on payment_transactions;
create trigger trg_payment_transactions_updated_at
  before update on payment_transactions
  for each row execute function set_updated_at();

alter table payment_transactions enable row level security;

drop policy if exists "Users and admins can view payments" on payment_transactions;
create policy "Users and admins can view payments"
  on payment_transactions for select
  using (auth.uid() = user_id or is_admin());

drop policy if exists "Users and admins can insert payments" on payment_transactions;
create policy "Users and admins can insert payments"
  on payment_transactions for insert
  with check (auth.uid() = user_id or is_admin());

drop policy if exists "Users and admins can update payments" on payment_transactions;
create policy "Users and admins can update payments"
  on payment_transactions for update
  using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());


-- ------------------------------------------------------------
-- Trigger: Synchronize Payment Success to Claim Record
-- ------------------------------------------------------------
create or replace function handle_payment_transaction_update()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid') then
    if new.payment_type = 'assistance_fee' then
      update claim_requests
      set assistance_fee_paid = true,
          updated_at = now()
      where id = new.claim_id;
    elsif new.payment_type = 'success_fee' then
      update claim_requests
      set success_fee_paid = true,
          updated_at = now()
      where id = new.claim_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_payment_transactions_paid on payment_transactions;
create trigger trg_payment_transactions_paid
  after insert or update on payment_transactions
  for each row execute function handle_payment_transaction_update();


-- ------------------------------------------------------------
-- 7. create_claim_safe(): Atomic check-and-insert RPC
-- ------------------------------------------------------------
drop function if exists create_claim_safe(uuid) cascade;
drop function if exists create_claim_safe cascade;
create or replace function create_claim_safe(p_record_id uuid)
returns claim_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_claim claim_requests;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED: User must be signed in to create a claim.';
  end if;

  if p_record_id is null then
    raise exception 'INVALID_RECORD_ID: Record ID is required.';
  end if;

  if not exists (select 1 from unclaimed_records where id = p_record_id) then
    raise exception 'RECORD_NOT_FOUND: Unclaimed record not found.';
  end if;

  -- Check if user already has an active claim for this record
  if exists (
    select 1 from claim_requests
    where user_id = v_user_id
      and record_id = p_record_id
      and status not in ('rejected', 'cancelled')
  ) then
    raise exception 'DUPLICATE_CLAIM: You already have an active claim for this record. Check your Dashboard for its status.';
  end if;

  -- Insert claim
  insert into claim_requests (
    user_id,
    record_id,
    status,
    assistance_fee_amount,
    assistance_fee_paid,
    agreement_accepted
  )
  values (
    v_user_id,
    p_record_id,
    'submitted',
    299,
    false,
    false
  )
  returning * into v_claim;

  -- Link any existing anonymous call request matching this record
  update call_requests
  set user_id = v_user_id,
      updated_at = now()
  where record_id = p_record_id
    and user_id is null;

  return v_claim;
end;
$$;


-- ------------------------------------------------------------
-- 8. Storage bucket & policies for claim-documents
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('claim-documents', 'claim-documents', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload own claim documents" on storage.objects;
create policy "Users can upload own claim documents"
  on storage.objects for insert
  with check (
    bucket_id = 'claim-documents'
    and (auth.uid()::text = (storage.foldername(name))[1] or is_admin())
  );

drop policy if exists "Users and admins can view claim documents storage" on storage.objects;
create policy "Users and admins can view claim documents storage"
  on storage.objects for select
  using (
    bucket_id = 'claim-documents'
    and (auth.uid()::text = (storage.foldername(name))[1] or is_admin())
  );

drop policy if exists "Users and admins can delete claim documents storage" on storage.objects;
create policy "Users and admins can delete claim documents storage"
  on storage.objects for delete
  using (
    bucket_id = 'claim-documents'
    and (auth.uid()::text = (storage.foldername(name))[1] or is_admin())
  );


-- ------------------------------------------------------------
-- 9. Realtime Publication
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'claim_requests'
  ) then
    alter publication supabase_realtime add table claim_requests;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'call_requests'
  ) then
    alter publication supabase_realtime add table call_requests;
  end if;
end;
$$;

-- ------------------------------------------------------------
-- 10. Role Grants
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

grant execute on function is_admin() to anon, authenticated;
grant execute on function fuzzy_search_unclaimed_records(text, float) to anon, authenticated;
grant execute on function get_total_records_count() to anon, authenticated;
grant execute on function get_call_status(uuid) to anon, authenticated;
grant execute on function check_called_requests(uuid[]) to anon, authenticated;

grant execute on function link_call_request(uuid, uuid) to authenticated;
grant execute on function get_authorized_asset_details(uuid) to authenticated;
grant execute on function create_claim_safe(uuid) to authenticated;

