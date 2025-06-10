
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lê as credenciais das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou Anon Key não estão configuradas. Verifique suas variáveis de ambiente (.env).');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
