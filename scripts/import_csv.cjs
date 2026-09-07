const fs = require('fs');
const { parse } = require('csv-parse/sync');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true });
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\[span_\d+\]|\(start_span\)|\(end_span\)/g, '').trim();
}

const vocabRaw = parseCSV('tmp/N4_Vocabulary.csv');
const grammarRaw = parseCSV('tmp/N4_Grammar.csv');

// Transform Vocab
// Note: Vocabulary CSV doesn't have "例句翻譯", only Grammar does.
const vocabData = vocabRaw.map(v => {
  let chString = v['漢字'] && v['漢字'] !== v['假名'] ? `${v['漢字']}[${v['假名']}]` : v['假名'];
  return {
    id: v['ID'],
    ch: chString,
    answers: [v['假名']],
    usage: `${v['詞性']} - ${v['中文意思']}`,
    example: cleanText(v['例句']),
    exampleZh: '' // No translation available in N4_Vocabulary.csv
  };
});

// Transform Grammar into 4-option MCQ
const grammarData = grammarRaw.filter(g => cleanText(g["例句翻譯"])).map((g, index) => {
  const correctOption = g['文法句型'];

  // Pick 3 random wrong options
  const wrongOptions = [];
  while (wrongOptions.length < 3) {
    const randomIdx = Math.floor(Math.random() * grammarRaw.length);
    const candidate = grammarRaw[randomIdx]['文法句型'];
    if (candidate !== correctOption && !wrongOptions.includes(candidate)) {
      wrongOptions.push(candidate);
    }
  }

  // Shuffle options
  const options = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(correctOption);

  return {
    id: g['ID'],
    question: `【接續】${g['接續方式']}\n【意思】${g['中文意思']}`,
    options: options,
    correct: correctIndex,
    explanation: g['中文意思'],
    example: cleanText(g['例句']),
    exampleZh: cleanText(g['例句翻譯'] || '')
  };
});

let questionsFile = fs.readFileSync('src/data/questions/index.js', 'utf-8');

// We need to clean up the previously injected data first to make this idempotent.
const vocabMarker = '// === 外部匯入 N4 單字 ===';
if (questionsFile.includes(vocabMarker)) {
    // Cut off everything from vocab marker to the closing bracket of VOCAB_DATA
    const startIdx = questionsFile.indexOf(vocabMarker);
    const prevStartIdx = questionsFile.lastIndexOf(',', startIdx);
    const endIdx = questionsFile.indexOf('];', startIdx);

    questionsFile = questionsFile.substring(0, prevStartIdx > -1 ? prevStartIdx : startIdx) + '\n' + questionsFile.substring(endIdx);
}

const grammarMarker = 'export const GRAMMAR_MCQ_DATA';
if (questionsFile.includes(grammarMarker)) {
    const startIdx = questionsFile.indexOf(grammarMarker);
    questionsFile = questionsFile.substring(0, startIdx);
}

// Inject into VOCAB_DATA
const vocabString = vocabData.map(v => `  ${JSON.stringify(v)}`).join(',\n');
const vocabArrayStart = questionsFile.indexOf('export const VOCAB_DATA = ['); const vocabInsertionPoint = questionsFile.indexOf('];', vocabArrayStart);
if (vocabInsertionPoint !== -1) {
    questionsFile = questionsFile.slice(0, vocabInsertionPoint) + ',\n  // === 外部匯入 N4 單字 ===\n' + vocabString + '\n' + questionsFile.slice(vocabInsertionPoint);
}

// Add GRAMMAR_MCQ_DATA
const grammarString = `\nexport const GRAMMAR_MCQ_DATA = [\n${grammarData.map(g => `  ${JSON.stringify(g)}`).join(',\n')}\n];\n`;
questionsFile += grammarString;

fs.writeFileSync('src/data/questions/index.js', questionsFile);
console.log('Successfully imported CSV data into src/data/questions/index.js');
