/**
 * Supabase Client Initialization
 * Configured with the user's Supabase API Key
 */

// Replace SUPABASE_URL with your Supabase Project URL from the Supabase Dashboard
export const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://whxqwxbxpugskfufshdb.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_GiMSfFe-T2zy6Ix3T_MGmA_hOsIZUJX';

// Initialize Supabase Client
export let supabase = null;

if (window.supabase) {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Supabase] Initialized successfully');
  } catch (err) {
    console.warn('[Supabase] Initialization pending Project URL setup:', err.message);
  }
} else {
  console.warn('[Supabase] CDN script not loaded or unavailable offline.');
}
