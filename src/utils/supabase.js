import { createClient } from '@supabase/supabase-js';  

// ¡IMPORTANTE! Este archivo necesita TUS credenciales reales para funcionar.  
// Si ves este error de conexión, es porque los valores abajo son placeholders.  

// PASO A PASO PARA OBTENER TUS CREDENCIALES REALES:  
// 1. Ve a https://supabase.com y haz login (o crea cuenta gratis).  
// 2. Crea un nuevo proyecto o selecciona uno existente.  
// 3. Espera 2 minutos a que se configure (es automático).  
// 4. Ve a "Settings" (icono de engranaje) > "API" en el menú izquierdo.  
// 5. Copia la "Project URL" (algo como https://abc123xyz.supabase.co).  
// 6. Copia la "anon public" key (empieza con eyJhbGci...).  
// 7. Pega abajo, reemplazando TODO lo que está entre comillas.  
// 8. Guarda el archivo y recarga la app.  
// 9. Prueba el botón "Probar Conexión" - debería salir verde.  

const supabaseUrl = 'https://plarayywtxedbiotsmmd.supabase.co'; // ← REEMPLAZA con tu Project URL  
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYXJheXl3dHhlZGJpb3RzbW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzQ0NTQsImV4cCI6MjA3MzcxMDQ1NH0.s585WUBDWj9F3O9r5c_mzUTdPGbpSFhez2FgJhyya9w...'; // ← REEMPLAZA con tu anon key  

// Si no lo haces, la app no guardará nada. ¡No seas vago, ve a Supabase ahora!  

export const supabase = createClient(supabaseUrl, supabaseKey);