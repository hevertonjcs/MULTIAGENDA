import { createClient } from '@supabase/supabase-js';

// Priorize as variáveis de ambiente definidas via Vite. Caso não estejam
// configuradas, utilize os valores embutidos no código como último recurso.
const supabaseUrlFromEnv = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKeyFromEnv = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Valores padrão extraídos do projeto original. Esses valores só serão
// utilizados se nenhuma variável de ambiente for fornecida.
const defaultSupabaseUrl = 'https://zzncabuockilivapgxrq.supabase.co';
const defaultSupabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6bmNhYnVvY2tpbGl2YXBneHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTgyMDMsImV4cCI6MjA2NTY3NDIwM30.NUxY1Zvq9jJ-FS0jJhfy495uhKLI6rcgQfZZ8uOBHRU';

const supabaseUrl = supabaseUrlFromEnv || defaultSupabaseUrl;
const supabaseAnonKey = supabaseAnonKeyFromEnv || defaultSupabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);