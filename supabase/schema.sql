-- ============================================================
-- UMANG Backend Schema (Supabase / Postgres)
-- Model: free search + free view.
-- Claim Assistance: one-time Rs.299 fee (documents/process guidance
-- and support) + 10% success fee, charged only on confirmed recovery.
-- Full fee structure is shown to the user before any charge.
-- ============================================================

create extension if not exists pg_trgm;

-- ------------------------------------------------------------
-- 1. unclaimed_records: the searchable dataset
--    (populate this from your licensed/legitimate data source,
--    e.g. IEPF, RBI UDGAM, LIC unclaimed amounts, AMC unclaimed
--    dividend lists)
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

create index if not exists idx_records_name_trgm
  on unclaimed_records using gin (
    (coalesce(first_name,'') || ' ' || coalesce(middle_name,'') || ' ' || coalesce(last_name,''))
    gin_trgm_ops
  );

create index if not exists idx_records_folio on unclaimed_records (folio_number);
create index if not exists idx_records_phone on unclaimed_records (phone_number);
create index if not exists idx_records_state on unclaimed_records (state);

create or replace function fuzzy_search_unclaimed_records(
  p_search_name text,
  p_threshold float default 0.3
)
returns setof unclaimed_records
language sql
stable
as $$
  select *
  from unclaimed_records
  where p_search_name is not null
    and similarity(
      coalesce(first_name,'') || ' ' || coalesce(middle_name,'') || ' ' || coalesce(last_name,''),
      p_search_name
    ) > p_threshold
  order by similarity(
      coalesce(first_name,'') || ' ' || coalesce(middle_name,'') || ' ' || coalesce(last_name,''),
      p_search_name
    ) desc
  limit 50;
$$;

alter table unclaimed_records enable row level security;
create policy "public can read records"
  on unclaimed_records for select
  using (true);

-- ------------------------------------------------------------
-- 2. claim_requests: created when a user starts Claim Assistance
--    on a specific record
-- ------------------------------------------------------------
create table if not exists claim_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  record_id uuid references unclaimed_records(id),
  status text not null default 'submitted'
    check (status in ('submitted', 'in_review', 'recovered', 'rejected')),
  assistance_fee_amount numeric default 299,
  assistance_fee_paid boolean default false,
  recovered_amount numeric,      -- filled in only once recovery is confirmed
  success_fee_paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_claims_user on claim_requests (user_id);
create index if not exists idx_claims_status on claim_requests (status);

alter table claim_requests enable row level security;

create policy "users can view own claims"
  on claim_requests for select
  using (auth.uid() = user_id);

create policy "users can create own claims"
  on claim_requests for insert
  with check (auth.uid() = user_id);

-- Status changes (submitted -> in_review -> recovered) and recovered_amount
-- are set by admins/service_role only, never by the end user, so success
-- fees can't be self-declared.

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_claim_requests_updated_at on claim_requests;
create trigger trg_claim_requests_updated_at
  before update on claim_requests
  for each row execute function set_updated_at();
