export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

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

    const { data: existingVocab } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('word', normalizedWord)
      .maybeSingle();

    if (existingVocab) {
      if (userId) {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            vocab_id: existingVocab.id,
            learning_level: 1,
            next_review_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,vocab_id', ignoreDuplicates: true });
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Từ đã tồn tại trong kho từ vựng. Đã thêm vào tiến độ học của bạn nếu chưa có.',
          vocabulary: existingVocab
        },
        { status: 200 }
      );
    }

    const { data: newVocab, error: insertError } = await supabase
      .from('vocabulary')
      .insert({
        word: normalizedWord,
        phonetic: phonetic || '',
        meaning,
        example_sentence: exampleText,
        cloze_sentence: clozeText,
        audio_us: '',
        audio_uk: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (userId) {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          vocab_id: newVocab.id,
          learning_level: 1,
          next_review_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,vocab_id', ignoreDuplicates: true });
    }

    return NextResponse.json(
      { success: true, vocabulary: newVocab },
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
