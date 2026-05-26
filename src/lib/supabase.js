import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://TU-PROYECTO.supabase.co"

const supabaseKey = "TU-ANON-KEY"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)
