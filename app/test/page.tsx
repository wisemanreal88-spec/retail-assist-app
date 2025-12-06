import getSupabaseClient from '@/lib/supabaseClient';

export default async function Page() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('test').select('*');

  return <pre>{JSON.stringify({ data, error }, null, 2)}</pre>;
}
