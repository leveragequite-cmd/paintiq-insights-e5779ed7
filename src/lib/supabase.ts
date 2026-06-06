import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qxeimicxvjqhcbvchqic.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Xso3qG1kjFCQcMEZ4tNomw_iZ4WV0Ak";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
