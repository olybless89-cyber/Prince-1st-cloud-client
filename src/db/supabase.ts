
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://xjqgjinaubzmmtpseban.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcWdqaW5hdWJ6bW10cHNlYmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxODU2MzQsImV4cCI6MjEwMTc2MTYzNH0.y1t20Ho8pMVqXmrc9EkSbb_SiVDBomfDj6QDXDX0Bds";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
                