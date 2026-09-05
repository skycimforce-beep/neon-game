const fs = require('fs');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quotes in CSV
    let currentLine = lines[i];
    let inQuote = false;
    let values = [];
    let currentVal = '';

    for (let j = 0; j < currentLine.length; j++) {
      let char = currentLine[j];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    if (values.length === headers.length) {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      data.push(obj);
    }
  }
  return data;
}

const vocabRaw = parseCSV('tmp/N4_Vocabulary.csv');
const grammarRaw = parseCSV('tmp/N4_Grammar.csv');

// Transform Vocab
const vocabData = vocabRaw.map(v => {
  let chString = v['漢字'] && v['漢字'] !== v['假名'] ? `${v['漢字']}[${v['假名']}]` : v['假名'];
  return {
    id: v['ID'],
    ch: chString,
    answers: [v['假名']],
    usage: `${v['詞性']} - ${v['中文意思']}`,
    example: v['例句'],
    exampleZh: v['例句翻譯']
  };
});

// Transform Grammar into 4-option MCQ
// Let's test the grammar point given the Chinese translation.
const grammarData = grammarRaw.map((g, index) => {
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
    example: g['例句'],
    exampleZh: g['例句翻譯']
  };
});

let questionsFile = fs.readFileSync('src/data/questions/index.js', 'utf-8');

// Replace everything from "// === 外部匯入 N4 單字 ===" down to the end of VOCAB_DATA
// and the entire GRAMMAR_MCQ_DATA
// To do this cleanly, let's just write a script that replaces the specific sections.

const vocabStartIdx = questionsFile.indexOf('// === 外部匯入 N4 單字 ===');
if (vocabStartIdx !== -1) {
  let endOfVocabIdx = questionsFile.indexOf('];', vocabStartIdx);

  const vocabString = vocabData.map(v => `  ${JSON.stringify(v)}`).join(',\n');
  const replacement = `// === 外部匯入 N4 單字 ===\n${vocabString}\n`;

  questionsFile = questionsFile.substring(0, vocabStartIdx) + replacement + questionsFile.substring(endOfVocabIdx);
}

const grammarStartIdx = questionsFile.indexOf('export const GRAMMAR_MCQ_DATA = [');
if (grammarStartIdx !== -1) {
    const grammarString = `export const GRAMMAR_MCQ_DATA = [\n${grammarData.map(g => `  ${JSON.stringify(g)}`).join(',\n')}\n];\n`;
    questionsFile = questionsFile.substring(0, grammarStartIdx) + grammarString;
}

fs.writeFileSync('src/data/questions/index.js', questionsFile);
console.log('generated data in src/data/questions/index.js');
