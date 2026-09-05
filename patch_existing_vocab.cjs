const fs = require('fs');

let questionsFile = fs.readFileSync('src/data/questions/index.js', 'utf-8');

const existingTranslations = {
  v1: '總有一天想去宇宙。',
  v2: '這起事件對社會造成了很大的影響。',
  v3: '旅行的準備已經完成了嗎？',
  v4: '這裡很危險，請不要進去。',
  v5: '請人幫忙帶路介紹了市區。',
  v6: '請不要客氣盡情享用。',
  v7: '這台機器的構造很複雜。',
  v8: '這個問題非常簡單。',
  v9: '車子故障了動不了。',
  v10: '想要養成早起的習慣。',
  v11: '和老師商量了升學的事情。',
  v12: '明天下午方便嗎？',
  v13: '和朋友約好了見面。',
  v14: '請說明遲到的理由。',
  v15: '我經常使用圖書館。',
  v16: '把朋友介紹給父母了。',
  v17: '受邀參加了婚禮。',
  v18: '沒有什麼好擔心的。',
  v19: '請不要勉強，好好休息。',
  v20: '請切成適當的大小。',
  v21: '我反對他的意見。',
  v22: '我贊成那個提案。',
  v23: '時間還很充足。',
  v24: '這是一般的電車。',
  v25: '我直接問了本人。'
};

for (const [id, translation] of Object.entries(existingTranslations)) {
  const searchRegex = new RegExp("{ id: '" + id + "',[^\\n]*example: '[^']+' }", 'g');
  questionsFile = questionsFile.replace(searchRegex, (match) => {
    if (!match.includes('exampleZh')) {
       return match.replace(' }', `, exampleZh: '${translation}' }`);
    }
    return match;
  });
}

// Do the same for GRAMMAR_SORT_DATA
const sortTranslations = {
  gs1: '明明...',
  gs2: '打算...',
  gs3: '看似即將...'
};

for (const [id, translation] of Object.entries(sortTranslations)) {
  const searchRegex = new RegExp("{ id: '" + id + "',[^\\n]*example: '[^']+' }", 'g');
  questionsFile = questionsFile.replace(searchRegex, (match) => {
    if (!match.includes('exampleZh')) {
       return match.replace(' }', `, exampleZh: '${translation}' }`);
    }
    return match;
  });
}

// Grammer type data
const typeTranslations = {
  gt1: '被迫做...',
  gt2: '容易做...',
  gt3: '難以...'
};

for (const [id, translation] of Object.entries(typeTranslations)) {
  const searchRegex = new RegExp("{ id: '" + id + "',[^\\n]*example: '[^']+' }", 'g');
  questionsFile = questionsFile.replace(searchRegex, (match) => {
    if (!match.includes('exampleZh')) {
        return match.replace(' }', `, exampleZh: '${translation}' }`);
    }
    return match;
  });
}


fs.writeFileSync('src/data/questions/index.js', questionsFile);
console.log('patched existing hardcoded data');
