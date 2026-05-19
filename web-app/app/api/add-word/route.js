export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
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

    const { data: existingVocab } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('word', normalizedWord)
      .maybeSingle();

    if (existingVocab) {
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          vocab_id: existingVocab.id,
          learning_level: 1,
          next_review_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,vocab_id', ignoreDuplicates: true })
        .select()
        .maybeSingle();

      return NextResponse.json(
        {
          success: true,
          message: 'Từ đã tồn tại trong kho từ vựng. Đã thêm vào tiến độ học của bạn nếu chưa có.',
          vocabulary: existingVocab,
          progress: existingProgress || null
        },
        { status: 200 }
      );
    }

    const vocabularyData = await generateVocabularyData(word);

    const { data: newVocab, error: insertError } = await supabase
      .from('vocabulary')
      .insert({
        word: normalizedWord,
        phonetic: vocabularyData.phonetic || '',
        meaning: vocabularyData.meaning,
        example_sentence: vocabularyData.example_sentence,
        cloze_sentence: vocabularyData.cloze_sentence,
        audio_us: vocabularyData.audio_us || '',
        audio_uk: vocabularyData.audio_uk || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const { data: userProgress } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        vocab_id: newVocab.id,
        learning_level: 1,
        next_review_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

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
