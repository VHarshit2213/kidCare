// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

console.log("import.meta.env.VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL)
console.log("import.meta.env.VITE_SUPABASE_ANON_KEY", import.meta.env.VITE_SUPABASE_ANON_KEY)

 console.log("supabase ====---=--=>. ", supabase)

export default supabase;