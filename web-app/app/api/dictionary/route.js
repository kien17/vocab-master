export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
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

    const { data: exactResult } = await supabase
      .from('vocabulary')
      .select('*, user_progress(learning_level)')
      .ilike('word', searchTerm)
      .limit(1)
      .maybeSingle();

    if (exactResult) {
      const row = {
        id: exactResult.id,
        word: exactResult.word,
        phonetic: exactResult.phonetic,
        meaning: exactResult.meaning,
        example_sentence: exactResult.example_sentence,
        cloze_sentence: exactResult.cloze_sentence,
        audio_us: exactResult.audio_us,
        audio_uk: exactResult.audio_uk,
        learning_level: exactResult.user_progress?.[0]?.learning_level || 0
      };
      return NextResponse.json({ success: true, results: [row] }, { status: 200 });
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
