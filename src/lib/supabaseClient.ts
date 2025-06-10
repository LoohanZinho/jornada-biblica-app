import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// !!! AVISO DE SEGURANÇA !!!
// As credenciais abaixo foram fornecidas e integradas diretamente para fins de prototipagem.
// Para um ambiente de produção ou código versionado:
// 1. NUNCA exponha sua chave de 'service_role' no lado do cliente ou em código versionado.
// 2. A 'anon key' é pública, mas é uma BOA PRÁTICA armazenar tanto a URL quanto a 'anon key'
//    em variáveis de ambiente (ex: .env.local) e acessá-las via process.env.
//    Exemplo:
//    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Por favor, refatore para usar variáveis de ambiente.

const supabaseUrl = 'https://fobfebbmkptwtkmuntyn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYmZlYmJta3B0d3RrbXVudHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTU1MDcsImV4cCI6MjA2NTEzMTUwN30.EckmU4aTPicYmQCToOhxYGbCU54SdQKvLJsRoLvAlkM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou Anon Key não estão configuradas. Verifique suas credenciais ou variáveis de ambiente.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
