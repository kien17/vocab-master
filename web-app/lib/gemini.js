import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const makeCloze = (text, word) => {
  if (!text || !word) return '';
  const escapedWord = escapeRegex(word.trim());
  const regex = new RegExp(escapedWord, 'gi');
  return text.replace(regex, '___');
};

const createFallbackData = async (word, fallback = {}) => {
  const normalizedWord = word.trim();
  const translation = await fetchVietnameseTranslation(normalizedWord);
  const firstMeaning = fallback.meaning || translation || fallback.meanings?.[0]?.definition || '';
  const firstExample = fallback.example_sentence || fallback.meanings?.[0]?.example || `"${normalizedWord}" - ${translation || 'no translation available'}`;
  const firstCloze = fallback.cloze_sentence || fallback.meanings?.[0]?.cloze || makeCloze(firstExample, normalizedWord);

  const examples = (fallback.meanings || [])
    .filter(m => m.example)
    .map(m => ({
      sentence: m.example,
      cloze: m.cloze || makeCloze(m.example, normalizedWord)
    }));

  if (examples.length === 0) {
    examples.push({ sentence: firstExample, cloze: firstCloze });
  }

  return {
    phonetic: fallback.phonetic || '',
    audio_us: fallback.audio_us || '',
    audio_uk: fallback.audio_uk || '',
    audio_url: fallback.audio_url || '',
    meaning: firstMeaning || `Chưa có nghĩa tự động, hãy nhập thêm thông tin cho từ/cụm từ ${normalizedWord}.`,
    example_sentence: firstExample,
    cloze_sentence: firstCloze,
    examples
  };
};

const translationCache = new Map();

const fetchLibreTranslation = async (text) => {
  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'vi',
        format: 'text',
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.translatedText || null;
  } catch {
    return null;
  }
};

export const fetchVietnameseTranslation = async (text) => {
  try {
    const normalizedText = text.trim();
    if (!normalizedText) {
      return null;
    }

    const cached = translationCache.get(normalizedText);
    if (cached !== undefined) {
      return cached;
    }

    let result = await fetchLibreTranslation(normalizedText);

    if (!result) {
      const encodedText = encodeURIComponent(normalizedText);
      const langpair = encodeURIComponent('en|vi');
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langpair}`,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        result = data?.responseData?.translatedText || null;
      }
    }

    translationCache.set(normalizedText, result);
    return result;
  } catch (error) {
    console.error('fetchVietnameseTranslation error:', error);
    return null;
  }
};

export const fetchDictionaryPronunciation = async (word) => {
  try {
    const normalizedWord = word.trim().toLowerCase();
    if (!normalizedWord) {
      return null;
    }

    const queryWord = normalizedWord.replace(/[^a-z'\-\s]/g, '').trim();
    const isPhrase = queryWord.split(/\s+/).length > 1;

    if (isPhrase) {
      const words = queryWord.split(/\s+/);
      const translation = await fetchVietnameseTranslation(normalizedWord);
      let phrasePhonetic = '';
      let phraseAudioUs = '';
      let phraseAudioUk = '';

      if (words.length <= 4) {
        const phoneticParts = [];
        for (const w of words) {
          try {
            const res = await fetch(
              `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`,
              { headers: { Accept: 'application/json' } }
            );
            if (res.ok) {
              const data = await res.json();
              const entry = Array.isArray(data) ? data[0] : data;
              const p = entry?.phonetic || entry?.phonetics?.find((p) => p.text)?.text || '';
              phoneticParts.push(p || w);
            } else {
              phoneticParts.push(w);
            }
          } catch {
            phoneticParts.push(w);
          }
        }
        phrasePhonetic = phoneticParts.join(' ');
      }

      return {
        phonetic: phrasePhonetic,
        audio_us: phraseAudioUs,
        audio_uk: phraseAudioUk,
        meanings: [{
          partOfSpeech: 'phrase',
          definition: translation || normalizedWord,
          example: '',
          cloze: ''
        }]
      };
    }

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(queryWord)}`,
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const entry = Array.isArray(data) ? data[0] : data;
    const phonetic = entry?.phonetic || entry?.phonetics?.find((p) => p.text)?.text || '';
    const phoneticAudio = entry?.phonetics || [];
    const firstAudio = phoneticAudio.find((p) => p.audio)?.audio || '';
    const audio_us = entry?.phonetics?.find((p) => p.audio && p.audio.toLowerCase().includes('us'))?.audio || firstAudio || '';
    const audio_uk = entry?.phonetics?.find((p) => p.audio && p.audio.toLowerCase().includes('uk'))?.audio || firstAudio || '';

    const meanings = [];
    if (entry?.meanings) {
      for (const meaning of entry.meanings) {
        const partOfSpeech = meaning.partOfSpeech;
        for (const def of meaning.definitions.slice(0, 2)) {
          const englishDefinition = def.definition || '';
          const translatedDefinition = englishDefinition ? await fetchVietnameseTranslation(englishDefinition) : '';
          const definition = translatedDefinition || englishDefinition;
          const example = def.example || '';
          const cloze = example
            ? example.replace(new RegExp(`\\b${escapeRegex(word.trim())}\\b`, 'gi'), '___')
            : '';

          meanings.push({
            partOfSpeech,
            definition,
            example,
            cloze
          });
        }
      }
    }

    return {
      phonetic,
      audio_us,
      audio_uk,
      meanings
    };
  } catch (error) {
    console.error('fetchDictionaryPronunciation error:', error);
    return null;
  }
};

const geminiRateLimit = { lastCall: 0, minInterval: 2000 };

/**
 * Gọi Google Gemini API để lấy thông tin từ vựng
 */
export async function generateVocabularyData(word) {
  if (!GEMINI_API_KEY) {
    const dictData = await fetchDictionaryPronunciation(word);
    return createFallbackData(word, dictData || {});
  }

  const now = Date.now();
  if (now - geminiRateLimit.lastCall < geminiRateLimit.minInterval) {
    const dictData = await fetchDictionaryPronunciation(word);
    return createFallbackData(word, dictData || {});
  }
  geminiRateLimit.lastCall = now;

  try {
    const prompt = `
Trả về một JSON object chứa thông tin từ/cụm từ tiếng Anh sau đây. Định dạng phải là JSON hợp lệ:

Yêu cầu:
1. phonetic: Phiên âm IPA
2. meaning: Nghĩa tiếng Việt (ngắn gọn)
3. examples: Mảng chứa 3 câu ví dụ tiếng Anh chuẩn IELTS, mỗi câu kèm câu điền từ thay "${word}" bằng "___"

Từ/cụm từ: "${word}"

Trả về chỉ JSON object, không có text khác.
Ví dụ format:
{
  "phonetic": "/əˈkʌrəns/",
  "meaning": "Sự xuất hiện, sự xảy ra",
  "examples": [
    { "sentence": "The occurrence of natural disasters has increased significantly.", "cloze": "The ___ of natural disasters has increased significantly." },
    { "sentence": "This is a common occurrence in daily life.", "cloze": "This is a common ___ in daily life." },
    { "sentence": "We must reduce the occurrence of such errors.", "cloze": "We must reduce the ___ of such errors." }
  ]
}
    `;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }
    );

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return createFallbackData(word);
    }

    const vocabularyData = JSON.parse(jsonMatch[0]);
    return vocabularyData;
  } catch (error) {
    if (error.status !== 429) {
      console.error('Error calling Gemini API:', error.message);
    }
    const dictData = await fetchDictionaryPronunciation(word);
    return createFallbackData(word, dictData || {});
  }
}
