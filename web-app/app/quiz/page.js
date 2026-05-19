'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { playPhraseAudio } from '../../lib/audio';

const QUESTION_TYPES = [
  { id: 'choice', label: '4 lựa chọn' }
];

function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function QuizPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [quizItems, setQuizItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionType, setQuestionType] = useState('choice');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/login');
      return;
    }
    setUserId(storedUserId);
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const loadQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/quiz', { params: { userId } });
        if (response.data.success) {
          setQuizItems(response.data.questions || []);
        }
      } catch (error) {
        console.error('Quiz load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [userId]);

  useEffect(() => {
    if (currentQuestion) {
      const url = currentQuestion.audio_us || currentQuestion.audio_uk || '';
      playPhraseAudio(url, currentQuestion.word);
    }
  }, [currentQuestion]);

  const currentQuestion = quizItems[currentIndex] || null;

  const choices = useMemo(() => {
    if (!currentQuestion || quizItems.length === 0) return [];
    const allWords = quizItems.map((item) => item.word).filter((word) => word !== currentQuestion.word);
    const shuffled = shuffleArray(allWords).slice(0, 3);
    return shuffleArray([currentQuestion.word, ...shuffled]);
  }, [currentQuestion, quizItems]);

  const handleSubmit = () => {
    if (!currentQuestion) return;

    const normalizedWord = currentQuestion.word.trim().toLowerCase();
    const selected = selectedChoice?.trim().toLowerCase();
    const isCorrect = selected === normalizedWord;

    if (isCorrect) {
      setFeedback('🎉 Chính xác!');
    } else {
      setFeedback(`❌ Sai rồi. Đáp án đúng là: ${currentQuestion.word}`);
    }
  };

  const handleNext = () => {
    setSelectedChoice(null);
    setFeedback('');
    setCurrentIndex((prev) => (prev + 1) % quizItems.length);
  };

  const playWord = (audioUrl = '') => {
    if (!currentQuestion) return;
    playPhraseAudio(audioUrl, currentQuestion.word);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bài tập Vocab</h1>
            <p className="text-slate-600 mt-2">Luyện tập trắc nghiệm 4 lựa chọn.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-slate-700 font-semibold hover:bg-slate-300"
            >
              Trang chính
            </button>
            <button
              onClick={() => router.push('/search')}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
            >
              Tra từ
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          {isLoading ? (
            <p className="text-slate-600">Đang tải bài tập...</p>
          ) : quizItems.length === 0 ? (
            <div className="text-center">
              <p className="text-slate-600 mb-4">Chưa có từ để luyện tập. Hãy thêm từ trước khi bắt đầu.</p>
              <button
                onClick={() => router.push('/search')}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
              >
                Đi đến Tra từ
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-slate-200 p-6 mb-6">
                <div className="flex flex-col gap-2 mb-4">
                  <p className="text-sm text-slate-500">Câu hỏi {currentIndex + 1} / {quizItems.length}</p>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-semibold text-slate-900">{currentQuestion.meaning}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => playWord(currentQuestion.audio_us)}
                        className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                        title="US Pronunciation"
                      >
                        🔊 US
                      </button>
                      <button
                        onClick={() => playWord(currentQuestion.audio_uk)}
                        className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                        title="UK Pronunciation"
                      >
                        🔊 UK
                      </button>
                    </div>
                  </div>
                </div>
                {questionType === 'choice' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {choices.map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setSelectedChoice(choice)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${selectedChoice === choice ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-400'}`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={handleSubmit}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
                >
                  Kiểm tra
                </button>
                <button
                  onClick={handleNext}
                  className="rounded-2xl bg-slate-100 px-5 py-3 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Câu tiếp theo
                </button>
              </div>

              {feedback && (
                <div className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${feedback.startsWith('🎉') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {feedback}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
