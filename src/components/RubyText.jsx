import {
  KANJI_OR_DIGIT_RE,
  HIRAGANA_RE,
  KATAKANA_RE,
  normalizeRubyBrackets,
} from '../utils/ruby';

const extractRubyBase = (before, rt) => {
  // 1. Kanji / digit compound at end of `before`
  const kanjiMatch = before.match(
    new RegExp(`(${KANJI_OR_DIGIT_RE}+(?:[\\u3040-\\u309f]+${KANJI_OR_DIGIT_RE}+)*[\\u3040-\\u309f]*)$`)
  );
  if (kanjiMatch) {
    let base = kanjiMatch[1];
    const trailingMatch = base.match(/([\u3040-\u309f]+)$/);
    if (trailingMatch) {
      const trailing = trailingMatch[1];
      if (!(rt.length > trailing.length && rt.endsWith(trailing))) {
        base = base.slice(0, base.length - trailing.length);
      }
    }
    const prefix = before.slice(0, before.length - base.length);
    if ((prefix.endsWith('お') && rt.startsWith('お')) || (prefix.endsWith('ご') && rt.startsWith('ご'))) {
      base = prefix.slice(-1) + base;
    }
    return { plain: before.slice(0, before.length - base.length), base };
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
