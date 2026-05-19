export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

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

    const todayResult = await query(
      `SELECT
         up.id,
         up.learning_level,
         up.next_review_date,
         v.id AS vocab_id,
         v.word,
         v.phonetic,
         v.meaning,
         v.example_sentence,
         v.cloze_sentence
       FROM user_progress up
       JOIN vocabulary v ON up.vocab_id = v.id
       WHERE up.user_id = $1
         AND up.next_review_date <= NOW()
       ORDER BY up.next_review_date ASC`,
      [userId]
    );

    const todayWords = todayResult.rows.map((row) => ({
      id: row.id,
      learning_level: row.learning_level,
      next_review_date: row.next_review_date,
      vocabulary: {
        id: row.vocab_id,
        word: row.word,
        phonetic: row.phonetic,
        meaning: row.meaning,
        example_sentence: row.example_sentence,
        cloze_sentence: row.cloze_sentence
      }
    }));

    const allResult = await query(
      'SELECT learning_level FROM user_progress WHERE user_id = $1',
      [userId]
    );

    return NextResponse.json(
      {
        success: true,
        words_for_today: todayWords,
        all_progress: allResult.rows || []
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
