export function playPhraseAudio(audioUrls, text) {
  const urls = audioUrls ? audioUrls.split('|').filter(Boolean) : [];

  if (urls.length === 0) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return;
  }

  let index = 0;
  const playNext = () => {
    if (index >= urls.length) return;
    try {
      const audio = new Audio(urls[index]);
      audio.onended = () => { index++; playNext(); };
      audio.onerror = () => { index++; playNext(); };
      audio.play().catch(() => { index++; playNext(); });
    } catch {
      index++;
      playNext();
    }
  };
  playNext();
}
