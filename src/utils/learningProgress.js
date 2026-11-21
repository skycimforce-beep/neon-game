import {
  VOCAB_DATA,
  GRAMMAR_SORT_DATA,
  GRAMMAR_TYPE_DATA,
  GRAMMAR_MCQ_DATA,
  READING_DATA
} from '../data/questions';

export const DIFFICULTY_TIERS = [
  { id: 'all', label: '🌐 全域混合', desc: '全階段未掌握優先' },
  { id: '1', label: '🌱 Lv.1 初階生存', desc: '基礎詞彙與短句' },
  { id: '2', label: '🏙️ Lv.2 東京日常', desc: '進階活用與生活對話' },
  { id: '3', label: '💼 Lv.3 實戰試煉', desc: '高頻漢字與複合文法' }
];

export const stripRuby = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\[[^\]]+\]/g, '');
};

export const getMasteryStage = (count = 0, failCount = 0) => {
  if (count >= 3) {
    return { level: 3, label: '👑 直覺反射 Lv.3', shortLabel: 'Lv.3 ★', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/70' };
  }
  if (failCount >= 2 && count === 0) {
    return { level: 0, label: '🔴 宿敵警戒', shortLabel: '宿敵', badgeClass: 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse' };
  }
  if (count === 2) {
    return { level: 2, label: '⚡ 熟練強化 Lv.2', shortLabel: 'Lv.2', badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/70' };
  }
  if (count === 1) {
    return { level: 1, label: '👀 眼熟辨識 Lv.1', shortLabel: 'Lv.1', badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70' };
  }
  return { level: 0, label: '🌱 初次遭遇 Lv.0', shortLabel: 'Lv.0', badgeClass: 'bg-gray-800 text-gray-300 border-gray-600' };
};

export const getFlashThreshold = (type) => {
  if (type === 'reading') return 12.0;
  if (type === 'sort' || type === 'type') return 4.8;
  return 2.6;
};

// Precompute deterministic tiers (1, 2, 3) for all 1,013 items
const TIER_MAP = new Map();

const assignVocabTier = (item, idx) => {
  const plain = stripRuby(item.ch);
  const hasKanji = item.ch.includes('[');
  if (!hasKanji || (plain.length <= 2 && idx < 260)) return 1;
  if (plain.length <= 3 && idx < 500) return 2;
  return 3;
};

VOCAB_DATA.forEach((item, idx) => TIER_MAP.set(item.id, assignVocabTier(item, idx)));

const assignSequentialTier = (arr, type) => {
  arr.forEach((item, idx) => {
    if (type === 'reading') {
      const len = item.text?.length || 0;
      if (len <= 145) TIER_MAP.set(item.id, 1);
      else if (len <= 175) TIER_MAP.set(item.id, 2);
      else TIER_MAP.set(item.id, 3);
      return;
    }
    const textAll = `${item.prompt || ''} ${item.question || ''} ${item.translation || ''} ${item.example || ''}`;
    if (/受身|使役|尊敬|謙讓|敬語|意向|ば形|～らしい|～ようだ|～わけ|～はず/.test(textAll)) {
      TIER_MAP.set(item.id, 3);
    } else if (idx < Math.floor(arr.length / 3)) {
      TIER_MAP.set(item.id, 1);
    } else if (idx < Math.floor((arr.length * 2) / 3)) {
      TIER_MAP.set(item.id, 2);
    } else {
      TIER_MAP.set(item.id, 3);
    }
  });
};

assignSequentialTier(GRAMMAR_SORT_DATA, 'sort');
assignSequentialTier(GRAMMAR_TYPE_DATA, 'type');
assignSequentialTier(GRAMMAR_MCQ_DATA, 'mcq');
assignSequentialTier(READING_DATA, 'reading');

export const getQuestionTier = (id) => TIER_MAP.get(id) || 1;

export const getTierSummary = (masteryObj = {}) => {
  const allItems = [
    ...VOCAB_DATA,
    ...GRAMMAR_SORT_DATA,
    ...GRAMMAR_TYPE_DATA,
    ...GRAMMAR_MCQ_DATA,
    ...READING_DATA
  ];
  const stats = {
    1: { total: 0, mastered: 0 },
    2: { total: 0, mastered: 0 },
    3: { total: 0, mastered: 0 }
  };
  allItems.forEach((item) => {
    const t = getQuestionTier(item.id);
    stats[t].total += 1;
    if ((masteryObj[item.id] || 0) >= 3) stats[t].mastered += 1;
  });
  return stats;
};

// Pre-index vocab words for Reading Passage highlighting (skip single-char kana to prevent false positives)
const VOCAB_SURFACE_INDEX = VOCAB_DATA
  .map((v) => ({
    id: v.id,
    surface: stripRuby(v.ch),
    reading: v.answers?.[0] || '',
    usage: v.usage || '',
    ch: v.ch
  }))
  .filter((v) => v.surface.length >= 2 || /[\u4e00-\u9faf]/.test(v.surface) && v.surface.length >= 2)
  .sort((a, b) => b.surface.length - a.surface.length);

export const analyzeReadingPassage = (passageText, masteryObj = {}) => {
  if (!passageText) return { segments: [{ text: '', match: null }], matchedWords: [], knownCount: 0, masteredCount: 0, decodeRate: 0 };
  const plain = stripRuby(passageText);

  const foundEntries = [];
  const seenIds = new Set();

  for (const entry of VOCAB_SURFACE_INDEX) {
    if (plain.includes(entry.surface) && !seenIds.has(entry.id)) {
      seenIds.add(entry.id);
      foundEntries.push({
        ...entry,
        mastery: masteryObj[entry.id] || 0
      });
    }
  }

  // Only highlight words the player has encountered/learned (mastery >= 1) so the passage visibly lights up as you learn!
  const learnedMatches = foundEntries.filter((e) => e.mastery >= 1);
  const masteredCount = foundEntries.filter((e) => e.mastery >= 3).length;
  const knownCount = learnedMatches.length;
  const decodeRate = foundEntries.length > 0 ? Math.round((knownCount / foundEntries.length) * 100) : 0;

  if (learnedMatches.length === 0) {
    return {
      segments: [{ text: plain, match: null }],
      matchedWords: foundEntries,
      knownCount: 0,
      masteredCount: 0,
      decodeRate: 0
    };
  }

  // Build greedy non-overlapping segments sorted by surface length descending
  const sortedLearned = [...learnedMatches].sort((a, b) => b.surface.length - a.surface.length);
  const segments = [];
  let cursor = 0;

  while (cursor < plain.length) {
    let matched = null;
    for (const candidate of sortedLearned) {
      if (plain.startsWith(candidate.surface, cursor)) {
        matched = candidate;
        break;
      }
    }
    if (matched) {
      segments.push({ text: matched.surface, match: matched });
      cursor += matched.surface.length;
    } else {
      const prev = segments[segments.length - 1];
      if (prev && !prev.match) {
        prev.text += plain[cursor];
      } else {
        segments.push({ text: plain[cursor], match: null });
      }
      cursor += 1;
    }
  }

  return {
    segments,
    matchedWords: foundEntries,
    knownCount,
    masteredCount,
    decodeRate
  };
};

// Sub-skill classifiers
const SUBSKILL_DEFS = [
  {
    key: 'te_basic',
    label: 'て形・基礎活用',
    desc: '動詞て形 / ない形 / た形 / ます形接續',
    match: (text) => /て形|ない形|た形|ます形|～てみる|～てから|～ないで|～てしまう/.test(text)
  },
  {
    key: 'advanced_voice',
    label: '進階態（可能・受身・使役）',
    desc: '可能形 / 受身形 / 使役形 / 意向形 / 條件ば形',
    match: (text) => /可能|受身|被動|使役|意向|ば形|條件|～られる|～させる|～ようと/.test(text)
  },
  {
    key: 'keigo_giving',
    label: '敬語・授受表現',
    desc: '尊敬語 / 謙讓語 / あげる・もらう・くれる',
    match: (text) => /敬語|謙讓|尊敬|あげる|もらう|くれる|いただく|くださる|いらっしゃる|おっしゃる/.test(text)
  },
  {
    key: 'particles_conj',
    label: '助詞・複合句構語感',
    desc: 'ために / ように / わりに / ので / のに / なら',
    match: (text) => /助詞|わりに|ために|ように|ので|のに|なら|ながら|ばかり|ところ|はず|わけ/.test(text)
  }
];

const getItemSearchText = (item) =>
  `${item.ch || ''} ${item.usage || ''} ${item.context || ''} ${item.prompt || ''} ${item.question || ''} ${item.translation || ''} ${item.explanation || ''} ${item.example || ''}`;

const calcWeightedFamiliarity = (items, masteryObj) => {
  if (items.length === 0) return { total: 0, mastered: 0, familiar: 0, pct: 0 };
  let score = 0;
  let mastered = 0;
  let familiar = 0;
  for (const item of items) {
    const lv = Math.min(3, masteryObj[item.id] || 0);
    if (lv >= 3) mastered += 1;
    if (lv >= 1) familiar += 1;
    score += lv / 3;
  }
  return {
    total: items.length,
    mastered,
    familiar,
    pct: Math.round((score / items.length) * 100)
  };
};

export const computeSkillProfile = (playerData = {}) => {
  const masteryObj = playerData.mastery || {};
  const coreSkills = [
    { key: 'vocab', label: '🔤 漢字與詞彙力', ...calcWeightedFamiliarity(VOCAB_DATA, masteryObj), color: 'from-cyan-500 to-blue-500' },
    { key: 'sort', label: '🧩 句構重組語感', ...calcWeightedFamiliarity(GRAMMAR_SORT_DATA, masteryObj), color: 'from-emerald-500 to-teal-500' },
    { key: 'type', label: '⚡ 動詞活用變換', ...calcWeightedFamiliarity(GRAMMAR_TYPE_DATA, masteryObj), color: 'from-amber-500 to-orange-500' },
    { key: 'mcq', label: '📘 文法接續辨析', ...calcWeightedFamiliarity(GRAMMAR_MCQ_DATA, masteryObj), color: 'from-purple-500 to-fuchsia-500' },
    { key: 'reading', label: '📖 長文閱讀解碼', ...calcWeightedFamiliarity(READING_DATA, masteryObj), color: 'from-rose-500 to-pink-500' }
  ];

  const allGrammar = [...GRAMMAR_SORT_DATA, ...GRAMMAR_TYPE_DATA, ...GRAMMAR_MCQ_DATA];
  const subSkills = SUBSKILL_DEFS.map((def) => {
    const matched = allGrammar.filter((item) => def.match(getItemSearchText(item)));
    return {
      key: def.key,
      label: def.label,
      desc: def.desc,
      ...calcWeightedFamiliarity(matched, masteryObj)
    };
  });

  // Total weighted XP (each mastery point = 1 XP, max 3 per question)
  const totalMastered = coreSkills.reduce((s, c) => s + c.mastered, 0);
  const totalFamiliar = coreSkills.reduce((s, c) => s + c.familiar, 0);
  const xp = Object.values(masteryObj).reduce((s, v) => s + Math.min(3, Number(v) || 0), 0);

  const RANKS = [
    { minXp: 0, title: 'Lv.1 五十音見習生', badge: '🌱' },
    { minXp: 30, title: 'Lv.2 假名解碼員', badge: '🔓' },
    { minXp: 100, title: 'Lv.3 語感見習駭客', badge: '⚡' },
    { minXp: 250, title: 'Lv.4 東京街頭生存者', badge: '🏙️' },
    { minXp: 550, title: 'Lv.5 N4 文法破壁者', badge: '🗡️' },
    { minXp: 1000, title: 'Lv.6 準母語直覺駭客', badge: '🧠' },
    { minXp: 1800, title: 'Lv.7 N4 語譯宗師', badge: '👑' }
  ];

  let rankIdx = 0;
  RANKS.forEach((r, idx) => {
    if (xp >= r.minXp) rankIdx = idx;
  });
  const currentRank = RANKS[rankIdx];
  const nextRank = RANKS[rankIdx + 1] || null;
  const rankProgressPct = nextRank
    ? Math.min(100, Math.round(((xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100))
    : 100;

  const titles = [
    { id: 't_vocab', name: '🔤 漢字破讀師', unlocked: coreSkills[0].mastered >= 30, req: '完全掌握 30 個單字' },
    { id: 't_sort', name: '🧩 語順直覺大師', unlocked: coreSkills[1].mastered >= 10, req: '完全掌握 10 題文法重組' },
    { id: 't_type', name: '⚡ 活用變形達人', unlocked: coreSkills[2].mastered >= 10, req: '完全掌握 10 題動詞變化' },
    { id: 't_reading', name: '📖 閱讀解碼者', unlocked: coreSkills[4].mastered >= 5, req: '完全掌握 5 篇閱讀理解' },
    { id: 't_speed', name: '⚡ 閃電反射神經', unlocked: (playerData.bestAvgSpeed || 0) > 0 && playerData.bestAvgSpeed <= 3.0, req: '單場平均反應 ≤ 3.0 秒' },
    { id: 't_nemesis', name: '⚔️ 宿敵終結者', unlocked: (playerData.nemesisSlainCount || 0) >= 3, req: '討伐 3 次以上宿敵題目' }
  ];

  return {
    coreSkills,
    subSkills,
    totalMastered,
    totalFamiliar,
    xp,
    currentRank,
    nextRank,
    rankProgressPct,
    titles
  };
};

export const getAllCodexEntries = () => [
  ...VOCAB_DATA.map((d) => ({ id: d.id, type: 'vocab', typeLabel: '單字', title: d.ch, sub: d.usage, reading: d.answers?.[0] || '', tier: getQuestionTier(d.id), speakText: d.ch })),
  ...GRAMMAR_SORT_DATA.map((d) => ({ id: d.id, type: 'sort', typeLabel: '重組', title: `${d.context} ${d.correctOrder.map(i => d.parts[i]).join('')}`, sub: `${d.example || ''} — ${d.translation}`, reading: '', tier: getQuestionTier(d.id), speakText: `${d.context.replace('／', '')}${d.correctOrder.map(i => d.parts[i]).join('')}` })),
  ...GRAMMAR_TYPE_DATA.map((d) => ({ id: d.id, type: 'type', typeLabel: '活用', title: `${d.base} → ${d.correct}`, sub: d.translation, reading: '', tier: getQuestionTier(d.id), speakText: d.example || d.correct })),
  ...GRAMMAR_MCQ_DATA.map((d) => ({ id: d.id, type: 'mcq', typeLabel: '文法', title: d.options[d.correct], sub: `${d.question.replace(/\n/g, ' ')}`, reading: '', tier: getQuestionTier(d.id), speakText: d.example || d.options[d.correct] })),
  ...READING_DATA.map((d) => ({ id: d.id, type: 'reading', typeLabel: '閱讀', title: stripRuby(d.text).slice(0, 32) + '…', sub: d.translation.slice(0, 48) + '…', reading: '', tier: getQuestionTier(d.id), speakText: d.text }))
];
