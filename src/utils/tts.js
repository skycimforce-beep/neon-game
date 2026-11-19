import { stripRuby } from './ruby';

class JapaneseTTS {
  constructor() {
    this.enabled = true;
  }

  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  speak(rawText, rate = 0.9) {
    if (!this.enabled || !this.isSupported() || !rawText) return;
    const cleanText = stripRuby(rawText)
      .replace(/／/g, '、')
      .replace(/___/g, ' ')
      .replace(/(^|[\s、。/])[～〜]+/g, '$1')
      .trim();
    if (!cleanText) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ja'));
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS playback failed:', err);
    }
  }

  speakAnswer(rawAnswer, rate = 0.9) {
    if (!rawAnswer || typeof rawAnswer !== 'string') return;
    const stripped = stripRuby(rawAnswer)
      .split('（')[0]
      .split(' / ')[0]
      .trim();
    this.speak(stripped, rate);
  }
}

export const tts = new JapaneseTTS();
