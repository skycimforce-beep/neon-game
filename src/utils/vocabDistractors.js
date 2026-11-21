import { stripRuby } from './ruby';

const KANJI_RUN_RE = /[\u4e00-\u9faf\u3005\u30f6]+/;
const KANJI_SPLIT_RE = /([\u4e00-\u9faf\u3005\u30f6]+)/;
const INVALID_START_RE = /^[んっーゃゅょぁぃぅぇぉゎ]/;
const OBSTRUENT_HEAD_RE = /^[かきくけこさしすせそたちつてとはひふへほぱぴぷぺぽ]/;
const VOWEL_OR_SONORANT_HEAD_RE = /^[あいうえおなにぬねのまみむめもやゆよらりるれろわをん]/;

const SMALL_KANA_HEAD_RE = /^[ゃゅょぁぃぅぇぉゎー]/;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getMoraLength = (s) => (s ? s.replace(/[ゃゅょぁぃぅぇぉゎ]/g, '').length : 0);

const parseSkeleton = (ch, answer) => {
  const plain = stripRuby(ch);
  const segs = plain.split(KANJI_SPLIT_RE).filter(Boolean);
  const hasKana = segs.some((s) => !KANJI_RUN_RE.test(s));
  const pattern = segs
    .map((s) => (KANJI_RUN_RE.test(s) ? '(.+?)' : `${escapeRegex(s)}(?![ゃゅょぁぃぅぇぉゎー])`))
    .join('');
  const skeletonRe = new RegExp(`^${pattern}$`);
  const match = answer ? answer.match(skeletonRe) : null;
  return { plain, segs, hasKana, skeletonRe, match };
};

const isValidJapaneseTransition = (left, right) => {
  if (!left || !right) return true;
  if (SMALL_KANA_HEAD_RE.test(right)) return false;
  const last = left[left.length - 1];
  const first = right[0];
  if (last === 'っ' && (VOWEL_OR_SONORANT_HEAD_RE.test(first) || first === 'っ' || first === 'ー')) {
    return false;
  }
  if (last === 'っ' && !OBSTRUENT_HEAD_RE.test(first)) {
    return false;
  }
  return true;
};

const AWKWARD_READING_RE = /^(おっぱい|おしっこ|うんこ|うんち|ちんこ|ちんぽ|まんこ|くそ|しね)$/;

const isValidSynthesizedWord = (word, segValues) => {
  if (!word || INVALID_START_RE.test(word) || /っっ|ーー|っ$/.test(word)) return false;
  if (AWKWARD_READING_RE.test(word)) return false;
  for (let i = 0; i < segValues.length - 1; i++) {
    if (!isValidJapaneseTransition(segValues[i], segValues[i + 1])) return false;
  }
  return true;
};

let cachedIndex = null;
let cachedSource = null;

const getVocabIndex = (vocabList) => {
  if (cachedIndex && cachedSource === vocabList) return cachedIndex;

  const parsedEntries = [];
  const plainToReadings = new Map();
  const stemsByMora = new Map();

  for (const item of vocabList) {
    const answer = item.answers?.[0];
    if (!answer) continue;
    const info = parseSkeleton(item.ch, answer);
    if (!KANJI_RUN_RE.test(info.plain)) continue;

    if (!plainToReadings.has(info.plain)) plainToReadings.set(info.plain, new Set());
    plainToReadings.get(info.plain).add(answer);

    const slotValues = info.match ? info.match.slice(1) : [];
    parsedEntries.push({ item, answer, ...info, slotValues });

    for (const stem of slotValues) {
      if (!stem || INVALID_START_RE.test(stem) || /っ$/.test(stem)) continue;
      const mora = getMoraLength(stem);
      if (mora <= 0) continue;
      if (!stemsByMora.has(mora)) stemsByMora.set(mora, new Set());
      stemsByMora.get(mora).add(stem);
    }
  }

  // Fallback short mora pool in case a specific length has few stems
  const fallbackOneMora = [
    'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ'
  ];
  if (!stemsByMora.has(1)) stemsByMora.set(1, new Set());
  fallbackOneMora.forEach((m) => stemsByMora.get(1).add(m));

  const stemArraysByMora = new Map();
  for (const [mora, set] of stemsByMora.entries()) {
    stemArraysByMora.set(mora, [...set]);
  }

  cachedIndex = { parsedEntries, plainToReadings, stemArraysByMora };
  cachedSource = vocabList;
  return cachedIndex;
};

const getStemsNearMora = (stemArraysByMora, targetMora) => {
  const exact = stemArraysByMora.get(targetMora) || [];
  if (exact.length >= 12) return exact;
  const near = [...exact];
  for (const delta of [1, -1, 2, -2]) {
    const arr = stemArraysByMora.get(targetMora + delta);
    if (arr) near.push(...arr);
  }
  return near.length > 0 ? near : (stemArraysByMora.get(1) || []);
};

/**
 * Builds 4 reading choices for a kanji vocab question where wrong choices match
 * the question's visible kana skeleton (trailing/leading/inner okurigana) so players
 * cannot guess solely from trailing hiragana.
 */
export const buildVocabReadingOptions = (targetItem, vocabList, shuffleFn) => {
  const correct = targetItem.answers?.[0];
  if (!correct) return [];

  const { parsedEntries, plainToReadings, stemArraysByMora } = getVocabIndex(vocabList);
  const { plain, segs, hasKana, skeletonRe, match } = parseSkeleton(targetItem.ch, correct);
  const forbiddenReadings = plainToReadings.get(plain) || new Set([correct]);
  const usedReadings = new Set([correct]);
  const wrongReadings = [];

  const addCandidate = (ans) => {
    if (!ans || usedReadings.has(ans) || forbiddenReadings.has(ans)) return false;
    usedReadings.add(ans);
    wrongReadings.push(ans);
    return wrongReadings.length >= 3;
  };

  if (hasKana) {
    const allMatches = parsedEntries.filter(
      (e) =>
        e.item.id !== targetItem.id &&
        !forbiddenReadings.has(e.answer) &&
        skeletonRe.test(e.answer) &&
        !(e.answer.match(skeletonRe)?.slice(1) || []).some((cap) => SMALL_KANA_HEAD_RE.test(cap))
    );

    // Tier 1: Real words matching exact kana skeleton + close length (±1)
    const closeMatches = allMatches.filter((e) => Math.abs(getMoraLength(e.answer) - getMoraLength(correct)) <= 1);
    for (const e of shuffleFn(closeMatches)) {
      if (addCandidate(e.answer)) break;
    }

    // Tier 2: Real words matching exact kana skeleton (any length)
    if (wrongReadings.length < 3) {
      for (const e of shuffleFn(allMatches)) {
        if (addCandidate(e.answer)) break;
      }
    }

    // Tier 3: Synthesize same-kana-skeleton distractors using real kanji slot readings
    if (wrongReadings.length < 3 && match) {
      const origSlots = match.slice(1);
      const kanjiSegIndices = [];
      segs.forEach((s, idx) => {
        if (KANJI_RUN_RE.test(s)) kanjiSegIndices.push(idx);
      });

      const slotPools = origSlots.map((slot) => shuffleFn(getStemsNearMora(stemArraysByMora, getMoraLength(slot))));

      // Try varying individual kanji slots first (natural single-character swaps), then combined swaps
      let attempts = 0;
      const maxAttempts = 120;
      while (wrongReadings.length < 3 && attempts < maxAttempts) {
        attempts++;
        const segValues = [...segs];
        const chosenSlots = [...origSlots];

        if (kanjiSegIndices.length === 1 || attempts % 3 !== 0) {
          const slotIdxToChange = attempts % kanjiSegIndices.length;
          const pool = slotPools[slotIdxToChange];
          if (pool.length > 0) {
            chosenSlots[slotIdxToChange] = pool[(attempts + slotIdxToChange * 7) % pool.length];
          }
        } else {
          for (let k = 0; k < kanjiSegIndices.length; k++) {
            const pool = slotPools[k];
            if (pool.length > 0) {
              chosenSlots[k] = pool[(attempts * (k + 1) + k * 5) % pool.length];
            }
          }
        }

        kanjiSegIndices.forEach((segIdx, slotIdx) => {
          segValues[segIdx] = chosenSlots[slotIdx];
        });

        const candidate = segValues.join('');
        if (skeletonRe.test(candidate) && isValidSynthesizedWord(candidate, segValues)) {
          addCandidate(candidate);
        }
      }
    }
  } else {
    // Pure-kanji word: prioritize other pure-kanji words with matching kanji count & reading length
    const pureKanjiOthers = parsedEntries.filter(
      (e) => !e.hasKana && e.item.id !== targetItem.id && !forbiddenReadings.has(e.answer)
    );
    const tier1 = pureKanjiOthers.filter(
      (e) => e.plain.length === plain.length && Math.abs(e.answer.length - correct.length) <= 1
    );
    const tier2 = pureKanjiOthers.filter((e) => Math.abs(e.answer.length - correct.length) <= 1);

    for (const pool of [tier1, tier2, pureKanjiOthers]) {
      if (wrongReadings.length >= 3) break;
      for (const e of shuffleFn(pool)) {
        if (addCandidate(e.answer)) break;
      }
    }
  }

  // Final safety net: fill from any VOCAB_DATA readings if fewer than 3
  if (wrongReadings.length < 3) {
    for (const v of shuffleFn(vocabList)) {
      if (v.id !== targetItem.id && addCandidate(v.answers?.[0])) break;
    }
  }

  return shuffleFn([correct, ...wrongReadings.slice(0, 3)]);
};
