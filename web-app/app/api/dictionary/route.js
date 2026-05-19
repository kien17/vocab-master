export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { generateVocabularyData, fetchDictionaryPronunciation, fetchVietnameseTranslation } from '../../../lib/gemini';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('query')?.trim();

    if (!searchTerm) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    const exactResult = await query(
      `SELECT v.id, v.word, v.phonetic, v.meaning, v.example_sentence, v.cloze_sentence,
              v.audio_us, v.audio_uk, up.learning_level
       FROM vocabulary v
       LEFT JOIN user_progress up ON up.vocab_id = v.id
       WHERE LOWER(v.word) = LOWER($1)
       LIMIT 1`,
      [searchTerm]
    );

    if (exactResult.rows.length > 0) {
      return NextResponse.json({ success: true, results: exactResult.rows }, { status: 200 });
    }

    const translatedMeaning = await fetchVietnameseTranslation(searchTerm).catch(() => null);
    let aiData = await generateVocabularyData(searchTerm);
    const dictData = await fetchDictionaryPronunciation(searchTerm).catch(() => null);

    const fallbackMeaning = translatedMeaning || aiData.meaning || aiData.meanings?.[0]?.definition || '';
    const fallbackExample = aiData.example_sentence || aiData.meanings?.[0]?.example || searchTerm;

    const conciseMeaning = {
      partOfSpeech: 'short',
      definition: translatedMeaning || aiData.meaning || searchTerm,
      example: fallbackExample,
      cloze: aiData.cloze_sentence || ''
    };

    const rawMeanings = dictData?.meanings?.length > 0
      ? dictData.meanings
      : aiData.meanings?.length > 0
        ? aiData.meanings
        : [];

    const meanings = [conciseMeaning, ...rawMeanings];

    const usingAi = !!process.env.GEMINI_API_KEY;

    const mainResult = {
      id: null,
      word: searchTerm,
      phonetic: aiData.phonetic || dictData?.phonetic || '',
      audio_us: aiData.audio_us || dictData?.audio_us || '',
      audio_uk: aiData.audio_uk || dictData?.audio_uk || '',
      meanings,
      meaning: fallbackMeaning || `Dịch: ${translatedMeaning || searchTerm}`,
      example_sentence: fallbackExample,
      cloze_sentence: aiData.cloze_sentence || '',
      learning_level: 0,
      aiGenerated: usingAi
    };

    return NextResponse.json({ success: true, results: [mainResult], aiGenerated: usingAi }, { status: 200 });
  } catch (error) {
    console.error('Dictionary API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
