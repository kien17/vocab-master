import { supabase } from './supabase';

export async function query(sql, params = []) {
  const { data, error } = await supabase
    .rpc('exec_sql', { query_text: sql, query_params: params });
  if (error) throw error;
  return { rows: data || [] };
}
