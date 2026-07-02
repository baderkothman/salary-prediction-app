import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

function normalizeSupabaseUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.pathname === "/rest/v1" || url.pathname === "/rest/v1/") {
      return url.origin;
    }

    return value.replace(/\/$/, "");
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be an absolute URL");
  }
}

export const supabase = createClient(
  normalizeSupabaseUrl(supabaseUrl),
  supabaseAnonKey,
);
