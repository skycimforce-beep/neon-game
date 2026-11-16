import {
  KANJI_OR_DIGIT_RE,
  HIRAGANA_RE,
  KATAKANA_RE,
  toHiragana,
  normalizeRubyBrackets,
} from '../utils/ruby';

const extractRubyBase = (before, rt) => {
  const rtHira = toHiragana(rt);

  // 1. Kanji / digit word at end of `before` (with optional okurigana if rtHira ends with it)
  const simpleKanjiMatch = before.match(
    new RegExp(`(${KANJI_OR_DIGIT_RE}+)([\\u3040-\\u309f]*)$`)
  );
  if (simpleKanjiMatch) {
    const trailingHira = simpleKanjiMatch[2];
    if (!trailingHira || (rtHira.length > trailingHira.length && rtHira.endsWith(trailingHira))) {
      let base = simpleKanjiMatch[0];
      // Check if preceding kanji+hiragana is part of a compound word (e.g. 切符売り場, 我が家, 思い出す)
      const prefix = before.slice(0, before.length - base.length);
      const compoundMatch = prefix.match(
        new RegExp(`(${KANJI_OR_DIGIT_RE}+)([\\u3040-\\u309f]+)$`)
      );
      if (compoundMatch) {
        const [, k1, midHira] = compoundMatch;
        const minLen = k1.length + midHira.length + simpleKanjiMatch[1].length + trailingHira.length;
        const idx = rtHira.indexOf(midHira, 1);
        if (idx !== -1 && idx + midHira.length < rtHira.length && rtHira.length >= minLen) {
          base = compoundMatch[0] + base;
        }
      }
      const remPrefix = before.slice(0, before.length - base.length);
      if (
        (remPrefix.endsWith('お') && rtHira.startsWith('お')) ||
        (remPrefix.endsWith('ご') && rtHira.startsWith('ご'))
      ) {
        base = remPrefix.slice(-1) + base;
      }
      return { plain: before.slice(0, before.length - base.length), base };
    }
  }

  // 2. Katakana word with reading (e.g. ホーム[ほーむ])
  const kataMatch = before.match(new RegExp(`(${KATAKANA_RE}+)$`));
  if (kataMatch) {
    const base = kataMatch[1];
    return { plain: before.slice(0, before.length - base.length), base };
  }

  // 3. Hiragana word with katakana reading (e.g. きれい[キレイ])
  const hiraMatch = before.match(new RegExp(`(${HIRAGANA_RE}+)$`));
  if (hiraMatch && new RegExp(`^${KATAKANA_RE}+$`).test(rt)) {
    const hw = hiraMatch[1];
    const base = hw.length >= rt.length ? hw.slice(-rt.length) : hw;
    return { plain: before.slice(0, before.length - base.length), base };
  }

  return { plain: '', base: before };
};

export const RubyText = ({ text, showRuby = false }) => {
  if (!text || typeof text !== 'string') return text;

  const normalizedText = normalizeRubyBrackets(text);
  const regex = /([^[\]]+)\[([^\]]+)\]/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let keyIdx = 0;

  while ((match = regex.exec(normalizedText)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={keyIdx++}>{normalizedText.slice(lastIndex, match.index)}</span>);
    }

    const before = match[1];
    const rt = match[2];
    const { plain, base } = extractRubyBase(before, rt);

    if (plain) {
      nodes.push(<span key={keyIdx++}>{plain}</span>);
    }

    if (showRuby) {
      nodes.push(
        <ruby key={keyIdx++} className="mx-[2px]">
          {base}
          <rt className="text-[0.65em] text-cyan-300 font-bold -translate-y-1 tracking-widest select-none">{rt}</rt>
        </ruby>
      );
    } else {
      nodes.push(<span key={keyIdx++}>{base}</span>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < normalizedText.length) {
    nodes.push(<span key={keyIdx}>{normalizedText.slice(lastIndex)}</span>);
  }

  return <>{nodes}</>;
};
