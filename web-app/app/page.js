'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';
import Stats from '../components/Stats';
import { calculateStats } from '../lib/spaced-repetition';

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [wordsForToday, setWordsForToday] = useState([]);
  const [allProgress, setAllProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');

    if (!storedUserId) {
      router.push('/login');
      return;
    }

    setUserId(storedUserId);
    setUsername(storedUsername || '');
    setEmail(storedEmail || '');
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const fetchWords = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/review-words', {
          params: { userId }
        });

        if (response.data.success) {
          setWordsForToday(response.data.words_for_today || []);
          setAllProgress(response.data.all_progress || []);
          setStats(calculateStats(response.data.all_progress || []));
        }
      } catch (error) {
        console.error('Error fetching words:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    router.push('/login');
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.get('/api/review-words', {
        params: { userId }
      });

      if (response.data.success) {
        setWordsForToday(response.data.words_for_today || []);
        setAllProgress(response.data.all_progress || []);
        setStats(calculateStats(response.data.all_progress || []));
      }
    } catch (error) {
      console.error('Error updating words:', error);
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang chuẩn bị tài khoản...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải từ vựng...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm text-slate-500">Xin chào{username ? `, ${username}` : ''}</p>
            <h1 className="text-4xl font-bold text-slate-900 mt-2">Vocab Master</h1>
            <p className="text-slate-600 mt-2">Ôn tập từ vựng, tra từ và luyện tập ngay trên web.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/search')}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
            >
              Tra & Thêm từ
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700"
            >
              Bài tập
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-slate-700 font-semibold hover:bg-slate-300"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {stats && <Stats stats={stats} />}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600">
              {wordsForToday.length > 0
                ? `📚 ${wordsForToday.length} từ cần ôn hôm nay`
                : '📚 Không có từ cần ôn'}
            </span>
            {wordsForToday.length > 0 && (
              <span className="text-sm text-slate-400">
                Từ 1 / {wordsForToday.length}
              </span>
            )}
          </div>
        </div>

        {wordsForToday.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">🎉 Chưa có từ cần ôn hôm nay</h2>
            <p className="text-slate-600 mb-4">
              {allProgress.length > 0
                ? `Bạn đã lưu ${allProgress.length} từ. Hiện chưa có từ nào đến lịch ôn lại hôm nay.`
                : 'Bạn có thể tra từ mới và thêm vào danh sách để bắt đầu ôn tập.'}
            </p>
            <p className="text-slate-500 mb-6">
              {allProgress.length > 0
                ? 'Quay lại sau khi đến lịch ôn hoặc dùng Tra từ để thêm từ mới.'
                : 'Thêm từ mới bằng chức năng Tra từ để bắt đầu học.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => router.push('/search')}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
              >
                Tra từ ngay
              </button>
              <button
                onClick={() => router.push('/quiz')}
                className="rounded-2xl bg-slate-200 px-6 py-3 text-slate-700 font-semibold hover:bg-slate-300"
              >
                Bài tập sau
              </button>
            </div>
          </div>
        ) : (
          <ReviewCard
            vocabulary={wordsForToday[0].vocabulary}
            userProgress={wordsForToday[0]}
            allWords={wordsForToday}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </main>
  );
}
