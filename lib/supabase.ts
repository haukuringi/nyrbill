import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function kruna(): [string, string] {
  if (!URL || !KEY) {
    throw new Error(
      "Vantar NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sjá README).",
    );
  }
  return [URL, KEY];
}

// Þjónn: les opinber gögn, engin innskráning/lota.
export function supabaseThjonn(): SupabaseClient {
  const [url, key] = kruna();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Vafri (admin): geymir innskráningarlotuna í localStorage. RLS í gagnagrunninum
// sér um að bara stjórnendur megi skrifa – lykillinn hér er opinber að hönnun.
let vafri: SupabaseClient | null = null;
export function supabaseVafri(): SupabaseClient {
  if (!vafri) {
    const [url, key] = kruna();
    vafri = createClient(url, key);
  }
  return vafri;
}
