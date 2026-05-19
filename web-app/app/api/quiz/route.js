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

    const result = await query(
      `SELECT up.id as progress_id,
              v.id,
              v.word,
              v.phonetic,
              v.meaning,
              v.example_sentence,
              v.cloze_sentence,
              v.audio_us,
              v.audio_uk,
              up.learning_level
       FROM user_progress up
       JOIN vocabulary v ON v.id = up.vocab_id
       WHERE up.user_id = $1
       ORDER BY RANDOM()
       LIMIT 12`,
      [userId]
    );

    return NextResponse.json(
      { success: true, questions: result.rows },
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
