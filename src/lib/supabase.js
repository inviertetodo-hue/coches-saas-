import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ohtxirarsonewffizser.supabase.co"

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odHhpcmFyc29uZXdmZml6c2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODMzMDksImV4cCI6MjA5NTM1OTMwOX0.zeu3MSJJycg7FiVRj-wdJkLCiSC6AkPwCHUCu4yoEKo"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)
