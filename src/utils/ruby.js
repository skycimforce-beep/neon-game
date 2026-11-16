export const KANJI_OR_DIGIT_RE = '[0-9０-９一-龯々ヶ〆]';
export const HIRAGANA_RE = '[\\u3040-\\u309fー]';
export const KATAKANA_RE = '[\\u30a0-\\u30ffー]';
export const KANA_RE = '[\\u3040-\\u309f\\u30a0-\\u30ffー]';

/**
 * Convert katakana characters in a string to hiragana for reading comparisons.
 */
export const toHiragana = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
};

/**
 * Normalize full-width furigana parentheses `（...）` into `[...]`
 * without touching Chinese explanations or grammar aliases like `～てしまう（ちゃう）`.
 */
export const normalizeRubyBrackets = (text) => {
  if (!text || typeof text !== 'string') return text;
  let result = text.replace(
    new RegExp(`(${KANJI_OR_DIGIT_RE})（(${KANA_RE}+)）`, 'g'),
    '$1[$2]'
  );
  result = result.replace(
    new RegExp(`(${HIRAGANA_RE})（(${KATAKANA_RE}+)）`, 'g'),
    '$1[$2]'
  );
  return result;
};

/**
 * Strip furigana annotations (`[...]`) for clean Japanese TTS reading.
 */
export const stripRuby = (text) => {
  if (!text || typeof text !== 'string') return '';
  return normalizeRubyBrackets(text).replace(/\[[^\]]*\]/g, '');
};
