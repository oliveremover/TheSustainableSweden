import { createClient as createBrowserClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

if (!url || !key) {
  // warn in dev to make misconfiguration obvious
  // (do not throw here because this file may be imported in environments without env set)
  // eslint-disable-next-line no-console
  console.warn("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");
}

export const supabaseClient = createBrowserClient(url, key);