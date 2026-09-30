import { createClient } from '@supabase/supabase-js'

// Supabase URL'ni buraya yapıştır (Tırnakları silme!)
const supabaseUrl = 'https://hesiddxwwerxahlhnmru.supabase.co' 

// Uzun anon key'i buraya yapıştır (Tırnakları silme!)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlc2lkZHh3d2VyeGFobGhubXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzY2MDAsImV4cCI6MjEwNjM1MjYwMH0.TQsmyJaHtPmIk2w8oUirLkTW-aeGSHIi0F2zGDxH5SA' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)