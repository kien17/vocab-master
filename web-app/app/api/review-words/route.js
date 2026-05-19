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

    const { data: todayWords, error } = await supabase
      .from('user_progress')
      .select('*, vocabulary(*)')
      .eq('user_id', userId)
      .lte('next_review_date', new Date().toISOString())
      .order('next_review_date', { ascending: true });

    if (error) throw error;

    const mapped = (todayWords || []).map((row) => ({
      id: row.id,
      learning_level: row.learning_level,
      next_review_date: row.next_review_date,
      vocabulary: {
        id: row.vocab_id,
        word: row.vocabulary?.word,
        phonetic: row.vocabulary?.phonetic,
        meaning: row.vocabulary?.meaning,
        example_sentence: row.vocabulary?.example_sentence,
        cloze_sentence: row.vocabulary?.cloze_sentence
      }
    }));

    const { data: allProgress } = await supabase
      .from('user_progress')
      .select('learning_level')
      .eq('user_id', userId);

    return NextResponse.json(
      {
        success: true,
        words_for_today: mapped,
        all_progress: allProgress || []
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in get-review-words API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
