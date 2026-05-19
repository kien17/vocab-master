'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { playPhraseAudio } from '../lib/audio';
import { calculateNextReview } from '../lib/spaced-repetition';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTimeRemaining(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Ngay bây giờ';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days} ngày`;
  if (hours > 0) return `${hours} giờ`;
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${minutes} phút`;
}

export default function ReviewCard({ vocabulary, userProgress, allWords = [], onUpdate }) {
  const router = useRouter();
  const [quizMode, setQuizMode] = useState('choice');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rated, setRated] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState(null);

  const [audioUs, setAudioUs] = useState('');
  const [audioUk, setAudioUk] = useState('');

  const otherWords = useMemo(() => {
    return allWords
      .map(w => w.vocabulary?.word || w.word)
      .filter(w => w !== vocabulary.word);
  }, [allWords, vocabulary.word]);

  const choices = useMemo(() => {
    const shuffled = shuffleArray(otherWords).slice(0, 3);
    if (shuffled.length < 3) {
      const fallback = ['important', 'beautiful', 'different', 'necessary', 'possible'];
      for (const w of fallback) {
        if (shuffled.length >= 3) break;
        if (!shuffled.includes(w) && w !== vocabulary.word) shuffled.push(w);
      }
    }
    return shuffleArray([vocabulary.word, ...shuffled]);
  }, [otherWords, vocabulary.word]);

  useEffect(() => {
    const loadAudio = async () => {
      if (!vocabulary.word) return;
      try {
        const resp = await axios.get('/api/dictionary', { params: { query: vocabulary.word } });
        const data = resp.data.results?.[0];
        if (data) {
          setAudioUs(data.audio_us || '');
          setAudioUk(data.audio_uk || '');
          const url = data.audio_us || data.audio_uk || '';
          playPhraseAudio(url, vocabulary.word);
        } else {
          playPhraseAudio('', vocabulary.word);
        }
      } catch {
        playPhraseAudio('', vocabulary.word);
      }
    };
    loadAudio();
    setSelectedChoice(null);
    setSubmitted(false);
    setIsCorrect(false);
    setRated(false);
    setNextReviewDate(null);
    const modes = ['choice', 'listen-choice'];
    setQuizMode(modes[Math.floor(Math.random() * modes.length)]);
  }, [vocabulary.word]);

  const playAudio = (url) => {
    playPhraseAudio(url, vocabulary.word);
  };

  const handleSubmitAnswer = () => {
    const correct = selectedChoice?.trim().toLowerCase() === vocabulary.word.trim().toLowerCase();
    setIsCorrect(correct);
    setSubmitted(true);
  };

  const handleReview = async (difficulty) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/update-progress', {
        vocab_id: vocabulary.id,
        user_progress_id: userProgress.id,
        difficulty,
        current_level: userProgress.learning_level
      });

      if (response.data.success) {
        const result = calculateNextReview(userProgress.learning_level, difficulty);
        setNextReviewDate(result.nextReviewDate);
        setRated(true);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Lỗi khi cập nhật tiến độ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextWord = () => {
    onUpdate();
    router.refresh();
  };

  const modes = [
    { id: 'choice', label: 'Trắc nghiệm' },
    { id: 'listen-choice', label: 'Nghe & trắc nghiệm' }
  ];

  if (rated && nextReviewDate) {
    return (
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className={`text-6xl mb-4 ${isCorrect ? '' : ''}`}>
            {isCorrect ? '✅' : '💪'}
          </div>
          <p className="text-xl font-bold text-slate-900 mb-2">{vocabulary.word}</p>
          <p className="text-slate-600 mb-4">{vocabulary.meaning}</p>
          <p className="text-sm text-slate-500 mb-2">
            Lần kiểm tra sau: <span className="font-semibold text-blue-600">{formatTimeRemaining(nextReviewDate)}</span>
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(userProgress.learning_level / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mb-6">Mức độ hiện tại: {userProgress.learning_level}/5 → {calculateNextReview(userProgress.learning_level, 'easy').nextLevel}/5</p>
          <button
            onClick={handleNextWord}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
          >
            Từ tiếp theo ({allWords.length - 1} từ còn lại)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="text-center mb-3">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {modes.find(m => m.id === quizMode)?.label || 'Thẻ nhớ'}
        </span>
      </div>

      {/* Card */}
      <div className={`rounded-2xl shadow-lg p-8 ${submitted ? (isCorrect ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-red-700') : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
        <div className="text-center text-white">
          {!submitted ? (
            <>
              {quizMode === 'listen-choice' ? (
                <>
                  <p className="text-sm text-blue-200 mb-3">Nghe từ và chọn đáp án đúng:</p>
                  <div className="flex justify-center gap-3 mb-5">
                    <button onClick={() => playAudio(audioUs)} className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold hover:bg-white/30">🔊 US</button>
                    <button onClick={() => playAudio(audioUk)} className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold hover:bg-white/30">🔊 UK</button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {choices.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedChoice(c)}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${selectedChoice === c ? 'border-white bg-white/30' : 'border-white/30 bg-white/10 hover:bg-white/20'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedChoice}
                    className="mt-5 rounded-full bg-white/20 px-6 py-2 text-sm font-semibold hover:bg-white/30 transition disabled:opacity-40"
                  >
                    Kiểm tra
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-blue-200 mb-3">Chọn từ đúng với nghĩa:</p>
                  <p className="text-xl font-bold break-words mb-5">{vocabulary.meaning}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {choices.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedChoice(c)}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${selectedChoice === c ? 'border-white bg-white/30' : 'border-white/30 bg-white/10 hover:bg-white/20'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedChoice}
                    className="mt-5 rounded-full bg-white/20 px-6 py-2 text-sm font-semibold hover:bg-white/30 transition disabled:opacity-40"
                  >
                    Kiểm tra
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <p className={`text-5xl mb-3 ${isCorrect ? '' : ''}`}>{isCorrect ? '✅' : '❌'}</p>
              <p className="text-3xl font-bold mb-2">{vocabulary.word}</p>
              <p className="text-lg italic text-blue-100 mb-2">/{vocabulary.phonetic}/</p>
              <div className="flex justify-center gap-3 mb-3">
                <button onClick={(e) => { e.stopPropagation(); playAudio(audioUs); }} className="rounded-full bg-blue-400 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-300">🔊 US</button>
                <button onClick={(e) => { e.stopPropagation(); playAudio(audioUk); }} className="rounded-full bg-red-400 px-3 py-1 text-xs font-semibold text-white hover:bg-red-300">🔊 UK</button>
              </div>
              <p className="text-base text-blue-100">{vocabulary.meaning}</p>
            </>
          )}
        </div>
      </div>

      {/* Level indicator */}
      {submitted && !rated && (
        <div className="mb-3 text-center text-sm text-slate-500">
          Mức hiện tại: {userProgress.learning_level}/5
        </div>
      )}

      {/* Rating buttons */}
      {submitted && !rated && (
        <div className="mt-4">
          <p className="text-center text-xs text-slate-400 mb-3">Đánh giá mức độ nhớ:</p>
          <div className="flex gap-3">
            {[
              { key: 'forgot', label: 'Quên', time: formatTimeRemaining(calculateNextReview(userProgress.learning_level, 'forgot').nextReviewDate), cls: 'bg-red-500 hover:bg-red-600' },
              { key: 'hard', label: 'Khó nhớ', time: formatTimeRemaining(calculateNextReview(userProgress.learning_level, 'hard').nextReviewDate), cls: 'bg-yellow-500 hover:bg-yellow-600' },
              { key: 'easy', label: 'Dễ', time: formatTimeRemaining(calculateNextReview(userProgress.learning_level, 'easy').nextReviewDate), cls: 'bg-green-500 hover:bg-green-600' }
            ].map(b => (
              <button
                key={b.key}
                onClick={() => handleReview(b.key)}
                disabled={isLoading}
                className={`flex-1 ${b.cls} text-white font-semibold py-3 px-2 rounded-xl transition disabled:opacity-50 text-xs leading-tight`}
              >
                <div>{b.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5">Sau {b.time}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
