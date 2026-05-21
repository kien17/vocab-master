'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { playPhraseAudio } from '../../lib/audio';

export default function SearchPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [clozeSentence, setClozeSentence] = useState('');
  const [selectedMeanings, setSelectedMeanings] = useState({});

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/login');
      return;
    }
    setUserId(storedUserId);
  }, [router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setStatus('Nhập từ hoặc cụm từ cần tra.');
      return;
    }

    setIsLoading(true);
    setStatus('Đang tìm kiếm...');

    try {
      const response = await axios.get('/api/dictionary', {
        params: { query: searchQuery }
      });

      if (response.data.success) {
        setResults(response.data.results || []);
        setSelectedMeanings({});
        setStatus(response.data.results.length > 0 ? 'Đã tìm thấy kết quả.' : 'Không tìm thấy từ phù hợp. Bạn có thể thêm thủ công.');
      }
    } catch (error) {
      console.error('Dictionary search error:', error);
      setStatus('Lỗi khi tra từ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAdd = async () => {
    if (!word.trim() || !meaning.trim()) {
      setStatus('Từ và nghĩa là bắt buộc để thêm từ.');
      return;
    }

    setIsLoading(true);
    setStatus('Đang thêm từ...');

    try {
      const response = await axios.post('/api/vocabulary', {
        word,
        phonetic,
        meaning,
        example_sentence: exampleSentence,
        cloze_sentence: clozeSentence,
        userId
      });

      if (response.data.success) {
        setStatus(`Đã thêm từ ${response.data.vocabulary.word} thành công.`);
        setWord('');
        setMeaning('');
        setPhonetic('');
        setExampleSentence('');
        setClozeSentence('');
        setResults([response.data.vocabulary, ...results]);
      } else {
        setStatus(response.data.error || 'Không thể thêm từ.');
      }
    } catch (error) {
      console.error('Manual add error:', error);
      setStatus(error?.response?.data?.error || 'Lỗi khi thêm từ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!searchQuery.trim()) {
      setStatus('Nhập từ muốn lưu nhanh.');
      return;
    }

    setIsLoading(true);
    setStatus('Đang lưu từ nhanh...');

    try {
      const response = await axios.post('/api/add-word', {
        word: searchQuery,
        userId
      });

      if (response.data.success) {
        setStatus(`Đã lưu từ ${response.data.vocabulary.word} thành công.`);
        setResults([response.data.vocabulary, ...results]);
      } else {
        setStatus(response.data.error || 'Không thể lưu từ.');
      }
    } catch (error) {
      console.error('Quick add error:', error);
      setStatus(error?.response?.data?.error || 'Lỗi khi lưu từ nhanh.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSelectedMeanings = async (item) => {
    const selectedIndices = Object.keys(selectedMeanings).filter(key => selectedMeanings[key] && key.startsWith(`${item.word}-`)).map(key => parseInt(key.split('-')[1]));
    
    if (selectedIndices.length === 0) {
      setStatus('Chọn ít nhất một nghĩa để thêm.');
      return;
    }

    setIsLoading(true);
    setStatus('Đang thêm nghĩa đã chọn...');

    try {
      for (const index of selectedIndices) {
        const meaning = item.meanings[index];
        const response = await axios.post('/api/vocabulary', {
          word: item.word,
          phonetic: item.phonetic,
          meaning: meaning.definition,
          example_sentence: meaning.example,
          cloze_sentence: meaning.cloze,
          userId
        });

        if (!response.data.success) {
          throw new Error(response.data.error || 'Không thể thêm nghĩa.');
        }
      }

      setStatus(`Đã thêm ${selectedIndices.length} nghĩa thành công.`);
      setSelectedMeanings({});
    } catch (error) {
      console.error('Add selected meanings error:', error);
      setStatus(error?.response?.data?.error || 'Lỗi khi thêm nghĩa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (text, audioUrl = '') => {
    playPhraseAudio(audioUrl, text);
  };

  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const autoFillCloze = () => {
    if (!exampleSentence.trim() || !word.trim()) return;
    const escapedWord = escapeRegex(word.trim());
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    setClozeSentence(exampleSentence.replace(regex, '___'));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tra từ & Thêm từ</h1>
            <p className="text-slate-600 mt-2">Tìm nghĩa, thêm từ mới và bổ sung vào kho học của bạn.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-slate-700 font-semibold hover:bg-slate-300"
            >
              Trang chính
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700"
            >
              Bài tập
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Tra từ / cụm từ</h2>
              <div className="flex gap-3 flex-col sm:flex-row">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') handleSearch(); }}
                  placeholder="Nhập từ hoặc cụm từ cần tra"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
                  disabled={isLoading}
                >
                  Tra từ
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleQuickAdd}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  Thêm nhanh từ
                </button>
                <button
                  onClick={() => {
                    setWord(searchQuery);
                    setStatus('Đã sao chép từ vào ô thêm thủ công.');
                  }}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Sao chép vào form thêm thủ công
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-500">{status}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Kết quả tìm kiếm</h2>
              {isLoading && <p className="text-slate-500">Đang tải kết quả...</p>}
              {!isLoading && results.length === 0 && (
                <p className="text-slate-500">Chưa có kết quả. Thử tra lại hoặc thêm từ mới.</p>
              )}
              <div className="space-y-4">
                {results.map((item) => (
                  <article key={item.id || item.word} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-semibold text-slate-900">{item.word}</h3>
                          <p className="text-sm text-slate-500">{item.phonetic || 'Không có phiên âm'}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePlayAudio(item.word, item.audio_us)}
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                              title="US Pronunciation"
                            >
                              🔊 US
                            </button>
                            <button
                              onClick={() => handlePlayAudio(item.word, item.audio_uk)}
                              className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                              title="UK Pronunciation"
                            >
                              🔊 UK
                            </button>
                          </div>
                        </div>
                        {item.meaning && (
                          <p className="mt-3 text-slate-700 font-semibold">Nghĩa: {item.meaning}</p>
                        )}
                        {(item.meanings || []).filter(m => m.partOfSpeech === 'example').map((ex, i) => (
                          <div key={i} className="mt-2 pl-3 border-l-2 border-blue-200">
                            <p className="text-slate-500 italic">Ví dụ {i + 1}: {ex.example}</p>
                            <p className="text-slate-500 text-sm">Câu điền: {ex.cloze}</p>
                          </div>
                        ))}
                        {!item.meanings?.some(m => m.partOfSpeech === 'example') && item.example_sentence && (
                          <>
                            <p className="mt-2 text-slate-500 italic">Ví dụ: {item.example_sentence}</p>
                            {item.cloze_sentence && <p className="mt-2 text-slate-500">Câu điền: {item.cloze_sentence}</p>}
                          </>
                        )}
                        {item.meanings && item.meanings.length > 0 ? (
                          <div className="space-y-3 mt-4">
                            {item.meanings.map((meaning, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <input
                                  type="checkbox"
                                  checked={selectedMeanings[item.word + '-' + index] || false}
                                  onChange={(e) => setSelectedMeanings(prev => ({
                                    ...prev,
                                    [item.word + '-' + index]: e.target.checked
                                  }))}
                                  className="mt-1"
                                />
                                 <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-semibold uppercase ${meaning.partOfSpeech === 'short' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                      {meaning.partOfSpeech === 'short' ? 'NGHĨA CHÍNH' : meaning.partOfSpeech}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 mb-2">{meaning.definition}</p>
                                  {meaning.example && meaning.partOfSpeech !== 'short' && (
                                    <p className="text-slate-500 italic text-sm">Ví dụ: {meaning.example}</p>
                                  )}
                                  {meaning.cloze && meaning.partOfSpeech !== 'short' && (
                                    <p className="text-slate-500 text-sm">Câu điền: {meaning.cloze}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleAddSelectedMeanings(item)}
                                className="rounded-2xl bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 text-sm"
                                disabled={Object.values(selectedMeanings).filter(Boolean).length === 0}
                              >
                                Thêm nghĩa đã chọn
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.aiGenerated && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            AI
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Level: {item.learning_level || 0}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Thêm từ thủ công</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Từ / cụm từ</label>
                  <input
                    value={word}
                    onChange={(event) => setWord(event.target.value)}
                    placeholder="Ví dụ: aberration"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phiên âm</label>
                  <input
                    value={phonetic}
                    onChange={(event) => setPhonetic(event.target.value)}
                    placeholder="Ví dụ: /ˌæbəˈreɪʃn/"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nghĩa tiếng Việt</label>
                  <textarea
                    value={meaning}
                    onChange={(event) => setMeaning(event.target.value)}
                    placeholder="Nhập nghĩa ngắn gọn"
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Câu ví dụ</label>
                  <textarea
                    value={exampleSentence}
                    onChange={(event) => setExampleSentence(event.target.value)}
                    placeholder="Ví dụ: The aberration was obvious in the results."
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Câu điền từ (tùy chọn)</label>
                  <textarea
                    value={clozeSentence}
                    onChange={(event) => setClozeSentence(event.target.value)}
                    placeholder="Ví dụ: The ___ was obvious in the results."
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    autoFillCloze();
                    setStatus('Đã tạo câu điền từ tự động từ ví dụ.');
                  }}
                  className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Tạo câu điền từ tự động
                </button>
                <button
                  onClick={handleManualAdd}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700"
                  disabled={isLoading}
                >
                  Thêm từ vào kho
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Gợi ý</h2>
              <p className="text-slate-600 leading-7">
                Bạn có thể dùng nút &quot;Thêm nhanh từ&quot; để lưu từ ngay lập tức, hoặc nhập chi tiết để tạo câu ví dụ và câu điền từ.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
