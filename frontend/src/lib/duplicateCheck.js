// src/lib/duplicateCheck.js
//
// Safe claim creation — calls the create_claim_safe() RPC which does
// the check-and-insert atomically in Postgres. Use this everywhere
// you currently do a plain `supabase.from('claim_requests').insert(...)`
// for a new "File Claim".

import { supabase } from './supabaseClient'; // <-- adjust path if needed

/**
 * @param {string} recordId - the unclaimed_records.id being claimed
 * @returns {Promise<{claim: object|null, error: string|null, isDuplicate: boolean}>}
 */
export async function createClaimSafe(recordId) {
  const { data, error } = await supabase.rpc('create_claim_safe', {
    p_record_id: recordId,
  });

  if (error) {
    const isDuplicate = error.message?.includes('DUPLICATE_CLAIM');
    return {
      claim: null,
      isDuplicate,
      error: isDuplicate
        ? 'You already have an active claim for this record. Check your Dashboard for its status.'
        : (error.message || 'Could not file claim. Please try again.'),
    };
  }

  return { claim: data, isDuplicate: false, error: null };
}