import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

/**
 * Server-only client that bypasses RLS (service role). Use for checkout, webhooks, and token-gated reads.
 * Uses $env/dynamic/private so the key is read at request time in Netlify Functions (not only at Vite build time).
 */
export function createServiceRoleClient() {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. In Netlify: Site settings → Environment variables (ensure it is available to runtime / all scopes).'
    );
  }
  return createClient(PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
