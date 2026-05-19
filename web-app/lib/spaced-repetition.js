import { addDays } from 'date-fns';

/**
 * Spaced Repetition Algorithm - SM-2 Modified
 * 5 Learning Levels (giống MochiMochi)
 * Level 1: Quên lại (1-2 ngày)
 * Level 2: Khó nhớ (3 ngày)
 * Level 3: Bình thường (7 ngày)
 * Level 4: Dễ (14 ngày)
 * Level 5: Rất dễ (30 ngày)
 */

const REVIEW_INTERVALS = {
  1: 1,    // 1 ngày
  2: 3,    // 3 ngày
  3: 7,    // 7 ngày
  4: 14,   // 14 ngày
  5: 30    // 30 ngày
};

/**
 * Tính ngày ôn tập tiếp theo dựa trên mức độ khó
 * @param {number} currentLevel - Mức độ học hiện tại (1-5)
 * @param {string} difficulty - 'forgot' | 'hard' | 'easy'
 * @returns {object} { nextLevel, nextReviewDate }
 */
export const calculateNextReview = (currentLevel, difficulty) => {
  let nextLevel = currentLevel;
  
  switch (difficulty) {
    case 'forgot':
      // Quên - về lại level 1, ôn lại hôm nay
      nextLevel = 1;
      break;
    case 'hard':
      // Khó nhớ - giữ nguyên level, ôn lại ngày mai
      nextLevel = Math.max(1, currentLevel);
      break;
    case 'easy':
      // Dễ - tăng level lên, ôn lại sau (level * 2) ngày
      nextLevel = Math.min(5, currentLevel + 1);
      break;
    default:
      nextLevel = currentLevel;
  }

  const daysToAdd = REVIEW_INTERVALS[nextLevel] || 1;
  const nextReviewDate = addDays(new Date(), daysToAdd);

  return {
    nextLevel,
    nextReviewDate: nextReviewDate.toISOString()
  };
};

/**
 * Tính thống kê học tập
 */
export const calculateStats = (userProgress) => {
  const totalWords = userProgress.length;
  const level1Count = userProgress.filter(p => p.learning_level === 1).length;
  const level2Count = userProgress.filter(p => p.learning_level === 2).length;
  const level3Count = userProgress.filter(p => p.learning_level === 3).length;
  const level4Count = userProgress.filter(p => p.learning_level === 4).length;
  const level5Count = userProgress.filter(p => p.learning_level === 5).length;

  const averageLevel = totalWords > 0 
    ? (userProgress.reduce((sum, p) => sum + p.learning_level, 0) / totalWords).toFixed(2)
    : 0;

  return {
    totalWords,
    level1Count,
    level2Count,
    level3Count,
    level4Count,
    level5Count,
    averageLevel,
    masteredPercentage: ((level5Count / totalWords) * 100).toFixed(1) || 0
  };
};
