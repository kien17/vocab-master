import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Khởi tạo schema và bảng nếu chưa tồn tại
 */
export const initializeDatabase = async () => {
  try {
    // Bảng vocabulary
    const { data: vocabData, error: vocabError } = await supabase
      .from('vocabulary')
      .select('id')
      .limit(1);

    if (vocabError && vocabError.code === 'PGRST116') {
      // Bảng không tồn tại, cần tạo via SQL
      console.log('Vocabulary table not found, please create it in Supabase dashboard');
    }

    // Bảng user_progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('id')
      .limit(1);

    if (progressError && progressError.code === 'PGRST116') {
      console.log('User progress table not found, please create it in Supabase dashboard');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
