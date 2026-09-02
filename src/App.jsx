import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Zap, BookOpen, AlertTriangle, Play, Database, FileText, XCircle, ArrowRight, CalendarCheck, Lightbulb, Target } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// ⚠️ 請在這裡貼上你的 Firebase 設定 ⚠️
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCpXrQh7AktIh4hXaflxQ-gqmQcJzxqCYs",
  authDomain: "neon-game-26577.firebaseapp.com",
  projectId: "neon-game-26577",
  storageBucket: "neon-game-26577.firebasestorage.app",
  messagingSenderId: "822197953664",
  appId: "1:822197953664:web:0eede32e7265c7d801b265"
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase尚未設定或初始化失敗:', error);
}

// 你的專屬存檔代號 (可隨意更改)
const SAVE_ID = 'neon-game-n4-v1';

// --- 遊戲題庫資料 ---
const VOCAB_DATA = [
  { id: 'v1', ch: '宇宙', partOfSpeech: '名詞', answers: ['うちゅう', 'uchuu'], usage: '指包含地球在內的無限空間。', example: 'いつか宇宙（ウチュウ）に行（イ）きたいです。\n(總有一天想去宇宙。)' },
  { id: 'v2', ch: '探險', partOfSpeech: '名詞 / する動詞', answers: ['たんけん', 'tanken'], usage: '去未知的地方尋找事物。', example: '森（モリ）の中（ナカ）を探検（タンケン）する。\n(在森林裡探險。)' },
  { id: 'v3', ch: '危險', partOfSpeech: '名詞 / な形容詞', answers: ['きけん', 'kiken'], usage: '有受傷或死亡可能性的狀態。', example: 'ここは危険（キケン）だから、入（ハイ）らないで。\n(這裡很危險，請不要進入。)' },
  { id: 'v4', ch: '逃跑', partOfSpeech: '動詞 (第二類)', answers: ['にげる', 'nigeru'], usage: '為了避開危險而離開。', example: '泥棒（ドロボウ）が逃（ニ）げた。\n(小偷逃跑了。)' },
  { id: 'v5', ch: '複雜', partOfSpeech: 'な形容詞', answers: ['ふくざつ', 'fukuzatsu'], usage: '事物錯綜複雜，不容易理解。', example: 'この機械（キカイ）の操作（ソウサ）は複雑（フクザツ）です。\n(這台機器的操作很複雜。)' },
];

const GRAMMAR_DATA = [
  { id: 'g1', question: 'システムを再起動___なりません。', options: ['しなければ', 'しても', 'しなくて', 'する'], correct: 0, usage: '動詞未然形 + なければなりません', explanation: '表示「必須、義務」。如果不做某事就不行。', example: '明日（アシタ）、早（ハヤ）く起（オ）きなければなりません。\n(明天必須早起。)' },
  { id: 'g2', question: 'エネルギーが切れた___です。', options: ['ばかり', 'ところ', 'はず', 'かもしれない'], correct: 3, usage: '普通形 + かもしれない', explanation: '表示「也許、可能」。說話者認為有這可能性。', example: '明日（アシタ）は雨（アメ）が降（フ）るかもしれない。\n(明天可能會下雨。)' },
  { id: 'g3', question: 'このボタンを押す___、ドアが開きます。', options: ['と', 'ば', 'たら', 'なら'], correct: 0, usage: '動詞辭書形 + と', explanation: '表示必然的條件結果。一做A，必然發生B。', example: '春（ハル）になると、桜（サクラ）が咲（サ）きます。\n(一到春天櫻花就會開。)' },
];

const READING_DATA = [
  {
    id: 'r1', title: '【航海日誌 01】通信障害',
    text: '通信（ツウシン）システムが完全（カンゼン）にダウンした。現在（ゲンザイ）、我々（ワレワレ）は宇宙（ウチュウ）の迷子（マイゴ）になっている。早急（サッキュウ）にバックアップ電源（デンゲン）を探（サガ）さなければならない。',
    question: '現在主人公たちが直面している一番大きな問題は何ですか？',
    options: ['宇宙人が攻めてきた', '通信ができず迷子になっている', '食料がなくなった'],
    correct: 1
  }
];

const TOTAL_ENEMIES = VOCAB_DATA.length + GRAMMAR_DATA.length;

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('menu'); 
  const [isLoading, setIsLoading] = useState(true);
  const [checkInMsg, setCheckInMsg] = useState(null);
  
  const [playerData, setPlayerData] = useState({
    hp: 100, maxHp: 100, atk: 10, def: 5, ult: 0, maxUlt: 100, mistakes: [],
    critRate: 0.1, lastLoginDate: '', readLogs: [], mastery: {} 
  });

  const [questionPool, setQuestionPool] = useState({ vocab: [], grammar: [] });
  const [battleState, setBattleState] = useState({
    enemyHp: 50, enemyMaxHp: 50, enemyType: 'normal', currentQuestion: null, message: '',
    isHintUsed: false, hiddenOptions: []
  });
  const [inputValue, setInputValue] = useState('');
  
  const [feedback, setFeedback] = useState({
    show: false, damageTaken: 0, correctAnswer: '', usage: '', explanation: '', example: ''
  });

  useEffect(() => {
    if (!auth) { setIsLoading(false); return; }
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { console.error("Auth Error", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) { setIsLoading(false); return; }
    const docRef = doc(db, 'saves', `${SAVE_ID}_${user.uid}`);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPlayerData({
          ...data,
          critRate: data.critRate || 0.1,
          lastLoginDate: data.lastLoginDate || '',
          readLogs: data.readLogs || [],
          mastery: data.mastery || {}
        });
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const saveGame = async (newData) => {
    setPlayerData(newData);
    if (user && db) {
      const docRef = doc(db, 'saves', `${SAVE_ID}_${user.uid}`);
      await setDoc(docRef, newData, { merge: true });
    }
  };

  const getDefeatedEnemiesCount = () => Object.values(playerData.mastery).filter(count => count >= 3).length;
  const remainingEnemies = TOTAL_ENEMIES - getDefeatedEnemiesCount();
  const progressPercent = ((TOTAL_ENEMIES - remainingEnemies) / TOTAL_ENEMIES) * 100;

  const getNextQuestion = (type, currentMastery = playerData.mastery) => {
    const poolType = type === 'normal' ? 'vocab' : 'grammar';
    let currentPool = [...questionPool[poolType]];
    
    if (currentPool.length === 0) {
      const sourceData = type === 'normal' ? VOCAB_DATA : GRAMMAR_DATA;
      currentPool = shuffleArray(sourceData.filter(q => (currentMastery[q.id] || 0) < 3));
    }
    
    if (currentPool.length === 0) return null;
    const nextQ = currentPool.pop();
    setQuestionPool(prev => ({ ...prev, [poolType]: currentPool }));
    return nextQ;
  };

  const startBattle = () => {
    if (remainingEnemies === 0) {
      alert("N4 等級的敵人已完全消除！防禦協議已達 100%。");
      return;
    }
    const vocabRemaining = VOCAB_DATA.filter(q => (playerData.mastery[q.id] || 0) < 3).length;
    const grammarRemaining = GRAMMAR_DATA.filter(q => (playerData.mastery[q.id] || 0) < 3).length;

    let isBoss = Math.random() > 0.7;
    if (vocabRemaining === 0) isBoss = true;
    if (grammarRemaining === 0) isBoss = false;

    const type = isBoss ? 'boss' : 'normal';
    setBattleState({
      enemyHp: isBoss ? 100 : 50, enemyMaxHp: isBoss ? 100 : 50, enemyType: type,
      currentQuestion: getNextQuestion(type),
      message: isBoss ? '警告：遭遇高階亂碼 AI！需要文法權限覆寫。' : '遭遇一般亂碼病毒！請輸入單字指令解碼。',
      isHintUsed: false, hiddenOptions: []
    });
    setInputValue('');
    setFeedback({ show: false });
    setScreen('battle');
  };

  const handleAttack = (isCorrect, answerIdx = null) => {
    const { enemyType, currentQuestion, isHintUsed } = battleState;
    const qId = currentQuestion.id;
    let newPlayerData = { ...playerData };
    
    if (isCorrect) {
      const isCrit = Math.random() * 100 < newPlayerData.critRate;
      let damage = newPlayerData.atk + Math.floor(Math.random() * 5);
      let attackMsg = `直擊！造成 ${damage} 點數據傷害。`;
      if (isCrit) { damage *= 2; attackMsg = `【CRITICAL 爆擊！】核心直擊！造成 ${damage} 點巨額傷害。`; }

      const newEnemyHp = Math.max(0, battleState.enemyHp - damage);
      if (enemyType === 'normal') newPlayerData.def += 1; else newPlayerData.atk += 2;
      newPlayerData.ult = Math.min(newPlayerData.maxUlt, newPlayerData.ult + 10);

      if (!isHintUsed) {
        const currentStreak = newPlayerData.mastery[qId] || 0;
        newPlayerData.mastery = { ...newPlayerData.mastery, [qId]: currentStreak + 1 };
      }

      if (newEnemyHp <= 0) {
        setBattleState(prev => ({ ...prev, enemyHp: 0, message: '協議解除成功！病毒已清除。' }));
        setTimeout(() => setScreen('menu'), 1500);
      } else {
        const nextQ = getNextQuestion(enemyType, newPlayerData.mastery);
        if (!nextQ) {
           setBattleState(prev => ({ ...prev, enemyHp: 0, message: '該區域敵人已肅清！返回終端機。' }));
           setTimeout(() => setScreen('menu'), 1500);
        } else {
          setBattleState(prev => ({ ...prev, enemyHp: newEnemyHp, message: attackMsg, currentQuestion: nextQ, isHintUsed: false, hiddenOptions: [] }));
        }
        setInputValue('');
      }
      saveGame(newPlayerData);
    } else {
      const enemyAtk = enemyType === 'boss' ? 20 : 10;
      const damageTaken = Math.max(1, enemyAtk - Math.floor(newPlayerData.def / 2));
      newPlayerData.hp -= damageTaken;
      newPlayerData.mastery = { ...newPlayerData.mastery, [qId]: 0 };

      let displayCorrectAnswer = enemyType === 'normal' 
        ? `${currentQuestion.ch}（${currentQuestion.answers[0]}）` 
        : currentQuestion.options[currentQuestion.correct];

      const mistakeRecord = enemyType === 'normal' 
        ? { type: 'vocab', q: currentQuestion.ch, a: currentQuestion.answers[0], exp: currentQuestion.usage }
        : { type: 'grammar', q: currentQuestion.question, a: currentQuestion.options[currentQuestion.correct], exp: currentQuestion.explanation };
      
      if (!newPlayerData.mistakes.find(m => m.q === mistakeRecord.q)) {
        newPlayerData.mistakes = [mistakeRecord, ...newPlayerData.mistakes].slice(0, 30);
      }
      saveGame(newPlayerData);

      setFeedback({
        show: true, damageTaken, correctAnswer: displayCorrectAnswer, usage: currentQuestion.usage,
        explanation: currentQuestion.explanation || '', example: currentQuestion.example
      });
    }
  };

  const handleAcknowledgeFeedback = () => {
    setFeedback({ show: false });
    if (playerData.hp <= 0) {
      let resetData = { ...playerData, hp: playerData.maxHp };
      saveGame(resetData);
      alert("系統崩潰... 重新啟動中。");
      setScreen('menu');
    } else {
      const nextQ = getNextQuestion(battleState.enemyType, playerData.mastery);
      if (!nextQ) setScreen('menu');
      else {
        setBattleState(prev => ({ ...prev, message: '系統重置，準備下一波解碼。', currentQuestion: nextQ, isHintUsed: false, hiddenOptions: [] }));
        setInputValue('');
      }
    }
  };

  const handleUseHint = () => {
    const cost = Math.floor(playerData.maxUlt * 0.5);
    if (playerData.ult < cost) return;

    let newHiddenOptions = [];
    if (battleState.enemyType === 'boss') {
       let wrongIndices = [0, 1, 2, 3].filter(i => i !== battleState.currentQuestion.correct);
       wrongIndices = shuffleArray(wrongIndices).slice(0, 2);
       newHiddenOptions = wrongIndices;
    }

    setPlayerData(prev => {
      const newData = { ...prev, ult: prev.ult - cost };
      saveGame(newData);
      return newData;
    });

    setBattleState(prev => ({
      ...prev, isHintUsed: true, hiddenOptions: newHiddenOptions,
      message: '【系統提示】輔助模組已啟動。本次解碼將不計入熟練度。'
    }));
  };

  const getClozeExample = (exampleStr, keyword) => exampleStr.replace(keyword, '___');

  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const handleDailyCheckIn = () => {
    const today = getTodayString();
    if (playerData.lastLoginDate === today) return;

    let newCritRate = playerData.critRate || 0.1;
    let message = "";
    let isReset = false;

    if (!playerData.lastLoginDate) {
      newCritRate = 0.2; message = "系統首次連線！爆擊率 +0.1%";
    } else {
      const diffDays = Math.ceil(Math.abs(new Date(today) - new Date(playerData.lastLoginDate)) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) { newCritRate += 0.1; message = "連續連線成功！爆擊率 +0.1%"; } 
      else if (diffDays >= 2) { newCritRate = 0.1; isReset = true; message = `中斷連線！加成歸零，爆擊率重置為 0.1%`; }
    }
    saveGame({ ...playerData, lastLoginDate: today, critRate: parseFloat(newCritRate.toFixed(1)) });
    setCheckInMsg({ text: message, isReset });
    setTimeout(() => setCheckInMsg(null), 3000);
  };

  if (isLoading) return <div className="min-h-screen bg-gray-950 text-green-500 flex items-center justify-center font-mono">系統啟動中 System Initializing...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-cyan-50 font-mono flex flex-col md:max-w-md md:mx-auto border-x border-cyan-900/50 shadow-2xl shadow-cyan-900/20 relative">
      <header className="bg-gray-900 p-4 border-b border-cyan-800 flex flex-col gap-2 z-10 relative shadow-md">
        <div className="flex justify-between items-center text-sm">
          <span className="text-cyan-400 font-bold flex items-center gap-1"><Terminal size={16}/> 語譯駭客 N4協議</span>
          <span className="text-xs text-gray-500">UID: {user ? user.uid.substring(0,6) : 'OFFLINE'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-xs w-8">HP</span>
          <div className="flex-1 bg-gray-800 h-3 rounded-full overflow-hidden border border-red-900">
            <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${(Math.max(0, playerData.hp) / playerData.maxHp) * 100}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xs w-8">ULT</span>
          <div className="flex-1 bg-gray-800 h-3 rounded-full overflow-hidden border border-yellow-900" title="Ultimate 必殺技能量">
            <div className="bg-yellow-400 h-full transition-all duration-300" style={{ width: `${(playerData.ult / playerData.maxUlt) * 100}%` }}></div>
          </div>
        </div>
      </header>

      {checkInMsg && (
        <div className={`absolute top-24 left-4 right-4 z-50 p-4 rounded-lg border-2 shadow-xl animate-in slide-in-from-top-4 ${checkInMsg.isReset ? 'bg-red-900/90 border-red-500 text-red-100' : 'bg-green-900/90 border-green-500 text-green-100'}`}>
          <div className="font-bold flex items-center gap-2">
            <CalendarCheck /> {checkInMsg.text}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 flex flex-col relative z-0">
        
        {screen === 'menu' && (
          <div className="flex-1 flex flex-col gap-6 justify-center pb-4">
            <div className="bg-gray-900/60 p-4 rounded-lg border border-indigo-800 shadow-inner text-center">
              <h3 className="text-indigo-300 font-bold mb-2 flex justify-center items-center gap-2"><Target size={18}/> N4 剩餘敵人 (未熟練)</h3>
              <div className="text-xs text-gray-400 mb-2">連續答對 3 次即可完全清除該敵人資料。</div>
              <div className="relative h-6 bg-gray-800 rounded-full border border-indigo-900 overflow-hidden mb-1">
                <div className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white z-10 drop-shadow-md">
                  {remainingEnemies === 0 ? '清除率 100% !' : `剩餘 ${remainingEnemies} 隻病毒`}
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-lg border border-cyan-800 shadow-inner">
              <h2 className="text-center text-cyan-300 font-bold mb-4 border-b border-cyan-800 pb-2">駭客機體狀態</h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2 text-red-300"><Zap size={16}/> 攻擊力: {playerData.atk}</div>
                <div className="flex items-center gap-2 text-blue-300"><Shield size={16}/> 防火牆: {playerData.def}</div>
                <div className="flex items-center gap-2 text-yellow-300 col-span-2 justify-center bg-yellow-900/20 p-2 rounded border border-yellow-900/50">
                  <Zap size={16}/> 核心爆擊率: {playerData.critRate.toFixed(1)}%
                </div>
              </div>
              <button onClick={handleDailyCheckIn} disabled={playerData.lastLoginDate === getTodayString()} className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${playerData.lastLoginDate === getTodayString() ? 'bg-gray-800 text-gray-500 border border-gray-700' : 'bg-green-700/50 hover:bg-green-600/60 border border-green-500 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse'}`}>
                <CalendarCheck size={18} />
                {playerData.lastLoginDate === getTodayString() ? '今日已連線' : '每日連線 (+0.1% 爆擊)'}
              </button>
            </div>

            <button onClick={startBattle} disabled={remainingEnemies === 0} className={`p-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold transition-all ${remainingEnemies === 0 ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed' : 'bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500 text-cyan-100 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]'}`}>
              <Play size={24} /> {remainingEnemies === 0 ? '全區域肅清完畢' : '進入節點 (戰鬥)'}
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setScreen('reading')} className="bg-purple-900/30 border border-purple-500/50 p-4 rounded-xl flex flex-col items-center gap-2 active:scale-95">
                <BookOpen size={20} className="text-purple-400"/>
                <span className="text-sm">解密日誌</span>
              </button>
              <button onClick={() => setScreen('records')} className="bg-orange-900/30 border border-orange-500/50 p-4 rounded-xl flex flex-col items-center gap-2 active:scale-95">
                <Database size={20} className="text-orange-400"/>
                <span className="text-sm">錯誤日誌</span>
              </button>
            </div>
          </div>
        )}

        {screen === 'battle' && battleState.currentQuestion && (
          <div className="flex-1 flex flex-col relative">
            <div className={`transition-opacity duration-300 ${feedback.show ? 'opacity-20 pointer-events-none' : 'opacity-100'} flex-1 flex flex-col`}>
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-2 px-2">
                <span>連勝進度: {playerData.mastery[battleState.currentQuestion.id] || 0} / 3</span>
                <span>ID: {battleState.currentQuestion.id}</span>
              </div>

              <div className="flex flex-col items-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 border-4 ${battleState.enemyType === 'boss' ? 'bg-red-950 border-red-500 text-red-500' : 'bg-gray-800 border-red-700 text-red-400'}`}>
                  {battleState.enemyType === 'boss' ? '👾' : '🦠'}
                </div>
                <div className="w-48 bg-gray-800 h-2 rounded-full overflow-hidden border border-red-900">
                  <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${(battleState.enemyHp / battleState.enemyMaxHp) * 100}%` }}></div>
                </div>
              </div>
              
              <div className="bg-gray-900 border-l-4 border-cyan-500 p-3 mb-4 text-sm text-cyan-200 min-h-[3rem] flex items-center">
                {battleState.message}
              </div>

              <div className="flex-1 flex flex-col justify-end pb-4 gap-4">
                {!battleState.isHintUsed && playerData.ult >= Math.floor(playerData.maxUlt * 0.5) && (
                  <button onClick={handleUseHint} className="self-end text-yellow-400 text-xs flex items-center gap-1 bg-yellow-900/30 px-3 py-2 rounded-full border border-yellow-900 hover:bg-yellow-800/50 transition-colors">
                    <Lightbulb size={14} /> 使用提示 (消耗 50% ULT)
                  </button>
                )}
                {!battleState.isHintUsed && playerData.ult < Math.floor(playerData.maxUlt * 0.5) && (
                  <div className="self-end text-gray-600 text-xs px-3 py-2">ULT能量不足以啟動提示</div>
                )}

                {battleState.enemyType === 'normal' ? (
                  <form onSubmit={(e) => { e.preventDefault(); if(inputValue.trim()) handleAttack(battleState.currentQuestion.answers.includes(inputValue.toLowerCase().trim())); }} className="flex flex-col gap-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold tracking-widest">{battleState.currentQuestion.ch}</div>
                      <div className="text-cyan-500 text-xs mt-1 border border-cyan-800 bg-cyan-950/50 inline-block px-2 py-1 rounded">
                        [ {battleState.currentQuestion.partOfSpeech} ]
                      </div>
                    </div>
                    {battleState.isHintUsed && (
                      <div className="bg-yellow-950/40 border border-yellow-700/50 p-3 rounded-lg mt-2 text-sm text-yellow-200">
                        <div className="mb-1"><span className="text-gray-400">字首發音:</span> {battleState.currentQuestion.answers[0].charAt(0)} ...</div>
                        <div><span className="text-gray-400">例句:</span> <br/>{getClozeExample(battleState.currentQuestion.example, battleState.currentQuestion.ch)}</div>
                      </div>
                    )}
                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="輸入平假名或羅馬拼音" className="bg-gray-900 border border-cyan-700 rounded-lg p-4 text-center text-lg focus:outline-none focus:border-cyan-400 w-full mt-2" autoFocus disabled={feedback.show} />
                    <button type="submit" className="bg-cyan-800 hover:bg-cyan-700 text-white p-3 rounded-lg font-bold" disabled={feedback.show}>送出</button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="text-lg font-bold mb-4 text-center leading-relaxed bg-gray-900/50 p-3 rounded border border-gray-800">
                      {battleState.currentQuestion.question}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {battleState.currentQuestion.options.map((opt, idx) => {
                        const isHidden = battleState.isHintUsed && battleState.hiddenOptions.includes(idx);
                        return (
                          <button key={idx} onClick={() => handleAttack(idx === battleState.currentQuestion.correct, idx)} disabled={feedback.show || isHidden} className={`p-3 rounded-lg text-left border transition-all ${isHidden ? 'bg-gray-900/20 text-gray-800 border-gray-900/50 opacity-30 cursor-not-allowed' : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-cyan-500'}`}>
                            {idx + 1}. {isHidden ? '---' : opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {feedback.show && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-gray-900 border-2 border-red-500 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in duration-200">
                  <div className="bg-red-950/80 p-4 border-b border-red-900 flex items-center gap-3">
                    <XCircle className="text-red-500" size={28} />
                    <div>
                      <h3 className="font-bold text-red-400 text-lg">指令錯誤</h3>
                      <p className="text-red-300 text-xs">受到 {feedback.damageTaken} 點傷害。連勝歸零。</p>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">正確解答</span>
                      <div className="text-2xl font-bold text-green-400 bg-green-950/30 p-2 rounded text-center border border-green-900">{feedback.correctAnswer}</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <span className="text-xs text-blue-400 font-bold block mb-1">📝 用法 / 解析</span>
                      <p className="text-sm text-gray-200">{feedback.usage}</p>
                      {feedback.explanation && <p className="text-sm text-gray-300 mt-1">{feedback.explanation}</p>}
                    </div>
                    {feedback.example && (
                      <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <span className="text-xs text-yellow-400 font-bold block mb-1">🗣️ 例句 (含片假名讀音)</span>
                        <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{feedback.example}</p>
                      </div>
                    )}
                  </div>
                  <button onClick={handleAcknowledgeFeedback} className="m-4 mt-0 bg-cyan-700 hover:bg-cyan-600 text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors">
                    確認並繼續 <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {screen === 'reading' && (
          <div className="flex-1 flex flex-col gap-4 py-4">
             <div className="flex justify-between items-center mb-2">
              <h2 className="text-purple-400 font-bold text-xl flex items-center gap-2"><FileText /> 解密日誌檔案</h2>
            </div>
            <div className="bg-gray-900 border border-purple-900/50 p-4 rounded-lg">
              <h3 className="text-purple-300 font-bold mb-3 border-b border-purple-900/50 pb-2">{READING_DATA[0].title}</h3>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">{READING_DATA[0].text}</div>
            </div>
            <div className="mt-4">
              <p className="font-bold mb-4 text-cyan-100">{READING_DATA[0].question}</p>
              <div className="flex flex-col gap-2">
                {READING_DATA[0].options.map((opt, idx) => (
                  <button key={idx} onClick={() => {
                    if (idx === READING_DATA[0].correct) {
                      saveGame({ ...playerData, maxUlt: playerData.maxUlt + 20, ult: Math.min(playerData.maxUlt + 20, playerData.ult + 50) });
                      alert("資料解密成功！ULT能量與上限已提升。");
                    } else alert("解密失敗。");
                    setScreen('menu');
                  }} className="bg-gray-800 border border-gray-700 hover:bg-purple-900 p-3 rounded-lg text-left text-sm">{opt}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setScreen('menu')} className="mt-auto bg-cyan-900/50 border border-cyan-800 p-3 rounded-lg text-center text-sm text-cyan-200">返回終端機</button>
          </div>
        )}

        {screen === 'records' && (
           <div className="flex-1 flex flex-col py-4">
            <h2 className="text-orange-400 font-bold text-xl flex items-center gap-2 mb-4"><AlertTriangle /> 系統錯誤日誌</h2>
            {playerData.mistakes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">目前沒有錯誤紀錄。</div>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2">
                {playerData.mistakes.map((m, i) => (
                  <div key={i} className="bg-gray-900 border border-orange-900/30 p-3 rounded-lg shadow-sm">
                    <div className="text-xs text-orange-500 mb-1 font-bold">{m.type === 'vocab' ? '【單字】' : '【文法】'}</div>
                    <div className="font-bold text-lg mb-1">{m.q}</div>
                    <div className="text-sm text-green-400 mb-2">正確答案: {m.a}</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setScreen('menu')} className="mt-4 bg-gray-800 p-3 rounded-lg text-center text-sm text-gray-400">返回終端機</button>
          </div>
        )}
      </main>
    </div>
  );
}