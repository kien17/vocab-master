export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function POST(request) {
  try {
    const {
      word,
      phonetic,
      meaning,
      example_sentence,
      cloze_sentence,
      userId
    } = await request.json();

    if (!word || !meaning) {
      return NextResponse.json(
        { error: 'Từ và nghĩa là bắt buộc' },
        { status: 400 }
      );
    }

    const normalizedWord = word.toLowerCase().trim();
    const exampleText = example_sentence?.trim() || `The ${normalizedWord} is an important word.`;
    const regex = new RegExp(escapeRegExp(normalizedWord), 'gi');
    const clozeText = cloze_sentence?.trim() || exampleText.replace(regex, '___');

    const existing = await query(
      'SELECT * FROM vocabulary WHERE word = $1',
      [normalizedWord]
    );

    if (existing.rows.length > 0) {
      const existingVocabulary = existing.rows[0];

      if (userId) {
        await query(
          `INSERT INTO user_progress (user_id, vocab_id, learning_level, next_review_date, created_at, updated_at)
           VALUES ($1, $2, 1, NOW(), NOW(), NOW())
           ON CONFLICT (user_id, vocab_id) DO NOTHING`,
          [userId, existingVocabulary.id]
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Từ đã tồn tại trong kho từ vựng. Đã thêm vào tiến độ học của bạn nếu chưa có.',
          vocabulary: existingVocabulary
        },
        { status: 200 }
      );
    }

    const insertResult = await query(
      `INSERT INTO vocabulary (word, phonetic, meaning, example_sentence, cloze_sentence, audio_us, audio_uk, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [normalizedWord, phonetic || '', meaning, exampleText, clozeText, '', '']
    );

    const newVocabulary = insertResult.rows[0];

    if (userId) {
      await query(
        `INSERT INTO user_progress (user_id, vocab_id, learning_level, next_review_date, created_at, updated_at)
         VALUES ($1, $2, 1, NOW(), NOW(), NOW())
         ON CONFLICT (user_id, vocab_id) DO NOTHING`,
        [userId, newVocabulary.id]
      );
    }

    return NextResponse.json(
      { success: true, vocabulary: newVocabulary },
      { status: 201 }
    );
  } catch (error) {
    console.error('Vocabulary POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
