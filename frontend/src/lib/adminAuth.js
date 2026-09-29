import { supabase } from './supabaseClient';

// ilike me % aur _ wildcard hote hain, isliye unhe escape kar rahe hain
const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function getCurrentAdminRole(email) {
  if (!email) return null;

  const { data, error } = await supabase
    .from('admin_users')
    .select('role, full_name, is_active')
    .ilike('email', escapeLike(email.trim()))
    .maybeSingle();

  if (error) {
    console.error('getCurrentAdminRole failed:', error);
    return null;
  }
  if (!data || data.is_active !== true) return null;
  return data; // { role, full_name, is_active }
}