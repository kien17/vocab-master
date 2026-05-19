export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const { data: allWords, error } = await supabase
      .from('user_progress')
      .select('*, vocabulary(*)')
      .eq('user_id', userId);

    if (error) throw error;

    const questions = (allWords || [])
      .sort(() => Math.random() - 0.5)
      .slice(0, 12)
      .map((row) => ({
        progress_id: row.id,
        id: row.vocab_id,
        word: row.vocabulary?.word,
        phonetic: row.vocabulary?.phonetic,
        meaning: row.vocabulary?.meaning,
        example_sentence: row.vocabulary?.example_sentence,
        cloze_sentence: row.vocabulary?.cloze_sentence,
        audio_us: row.vocabulary?.audio_us,
        audio_uk: row.vocabulary?.audio_uk,
        learning_level: row.learning_level
      }));

    return NextResponse.json(
      { success: true, questions },
      { status: 200 }
    );
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
