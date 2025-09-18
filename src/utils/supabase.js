import { createClient } from '@supabase/supabase-js'

// URL y anon key reales de tu proyecto Supabase
const supabaseUrl = 'https://plarayvxtwdebiotsmmd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYXJheXl3dHhlZGJpb3RzbW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzQ0NTQsImV4cCI6MjA3MzcxMDQ1NH0.s585WUBDWj9F3O9r5c_mzUTdPGbpSFhez2FgJhyya9w' // tu anon key

// Cliente exportado para usar en toda la app
export const supabase = createClient(supabaseUrl, supabaseKey)
