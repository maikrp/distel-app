import { createClient } from '@supabase/supabase-js'

// URL y anon key reales de tu proyecto Supabase
const supabaseUrl = 'https://plarayvxtwdebiotsmmd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // tu anon key

// Cliente exportado para usar en toda la app
export const supabase = createClient(supabaseUrl, supabaseKey)
