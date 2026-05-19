import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { generateVocabularyData } from '../../../lib/gemini';

export async function POST(request) {
  try {
    const { word, userId } = await request.json();

    if (!word || !userId) {
      return NextResponse.json(
        { error: 'Word and userId are required' },
        { status: 400 }
      );
    }

    const normalizedWord = word.toLowerCase().trim();

    const existingResult = await query(
      'SELECT * FROM vocabulary WHERE word = $1',
      [normalizedWord]
    );

    if (existingResult.rows.length > 0) {
      const existingVocab = existingResult.rows[0];

      const progressResult = await query(
        `INSERT INTO user_progress (user_id, vocab_id, learning_level, next_review_date, created_at, updated_at)
         VALUES ($1, $2, 1, NOW(), NOW(), NOW())
         ON CONFLICT (user_id, vocab_id) DO NOTHING
         RETURNING *`,
        [userId, existingVocab.id]
      );

      return NextResponse.json(
        {
          success: true,
          message: 'Từ đã tồn tại trong kho từ vựng. Đã thêm vào tiến độ học của bạn nếu chưa có.',
          vocabulary: existingVocab,
          progress: progressResult.rows[0] || null
        },
        { status: 200 }
      );
    }

    const vocabularyData = await generateVocabularyData(word);

    const insertVocab = await query(
      `INSERT INTO vocabulary (word, phonetic, meaning, example_sentence, cloze_sentence, audio_us, audio_uk, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        normalizedWord,
        vocabularyData.phonetic,
        vocabularyData.meaning,
        vocabularyData.example_sentence,
        vocabularyData.cloze_sentence,
        vocabularyData.audio_us || '',
        vocabularyData.audio_uk || ''
      ]
    );

    const newVocab = insertVocab.rows[0];

    const insertProgress = await query(
      `INSERT INTO user_progress (user_id, vocab_id, learning_level, next_review_date, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW(), NOW())
       RETURNING *`,
      [userId, newVocab.id, 1]
    );

    const userProgress = insertProgress.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Word added successfully',
        vocabulary: newVocab,
        progress: userProgress
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in add-word API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
