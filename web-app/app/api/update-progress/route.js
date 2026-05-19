export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
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

    const updateResult = await query(
      `UPDATE user_progress
       SET learning_level = $1,
           next_review_date = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [nextLevel, nextReviewDate, user_progress_id]
    );

    const updatedProgress = updateResult.rows[0];

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
