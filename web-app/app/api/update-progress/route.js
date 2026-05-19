export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { calculateNextReview } from '../../../lib/spaced-repetition';

export async function POST(request) {
  try {
    const {
      user_progress_id,
      vocab_id,
      difficulty,
      current_level
    } = await request.json();

    if (!user_progress_id || !vocab_id || !difficulty || current_level === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const { nextLevel, nextReviewDate } = calculateNextReview(current_level, difficulty);

    const { data: updatedProgress, error } = await supabase
      .from('user_progress')
      .update({
        learning_level: nextLevel,
        next_review_date: nextReviewDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user_progress_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: 'Progress updated successfully',
        progress: updatedProgress
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in update-progress API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
