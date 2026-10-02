import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Zap, BookOpen, AlertTriangle, Play, Database, FileText, XCircle, ArrowRight, CalendarCheck, Lightbulb, Target, UserCircle, LogOut, Backpack, Layers, Hexagon, Coins, Clock, FastForward, Gift, History, Lock, Pause, PlayCircle, Plus, RotateCcw, Search, Settings, ShoppingCart, Trash, Volume, XOctagon, CheckCircle, Volume2, VolumeX } from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { LoginScreen } from './components/LoginScreen';
import { GachaModal } from './components/GachaModal';
import { RubyText } from './components/RubyText';
import { VOCAB_DATA, GRAMMAR_SORT_DATA, GRAMMAR_TYPE_DATA, POTION_DATA, GRAMMAR_MCQ_DATA, READING_DATA } from './data/questions';
import { DEFAULT_GACHA_POOL, SET_BONUSES, VIRTUAL_GACHA_POOL } from './data/gachaPool';
import { sfx } from './utils/soundFX';

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
} catch (e) {}
const SAVE_ID = 'neon-game-n4';
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getWeekId = () => {
  const daysSinceEpoch = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor((daysSinceEpoch + 3) / 7);
  return `W${weekNum}`;
};

const generateBots = () => {
  const names = ['K1to', 'ZeroCool', 'AcidBurn', 'CrashOverride', 'CerealKiller', 'LordNikon', 'Phantom', 'Ghost', 'Neo', 'Trinity', 'Morpheus', 'Cypher', 'Oracle', 'Smith', 'V', 'Silverhand'];
  const selected = names.sort(() => 0.5 - Math.random()).slice(0, 9);
  return selected.map(name => ({ name, points: Math.floor(Math.random() * 50) }));
};

const DEFAULT_PLAYER_DATA = {
  hp: 100, maxHp: 100, atk: 10, def: 5, ult: 0, maxUlt: 100, mistakes: [],
  critRate: 5.0, lastLoginDate: '', readLogs: [], mastery: {}, killStreak: 0, highestStreak: 0,
  league: { tier: '青銅 (Bronze)', points: 0, weekId: getWeekId(), bots: generateBots() }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [callsign, setCallsign] = useState(null);
  const [showDetailedProgress, setShowDetailedProgress] = useState(false);
  const [screen, setScreen] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [playerData, setPlayerData] = useState(DEFAULT_PLAYER_DATA);

  const [questionPool, setQuestionPool] = useState({ vocab: [], grammar: [] });
  const [battleState, setBattleState] = useState({
    enemyHp: 50, enemyMaxHp: 50, enemyType: 'normal', currentQuestion: null, message: '',
    isHintUsed: false, hiddenOptions: []
  });
  const [inputValue, setInputValue] = useState('');
  const [streakAlert, setStreakAlert] = useState(null);
  
  const [feedback, setFeedback] = useState({
    show: false, damageTaken: 0, correctAnswer: '', usage: '', explanation: '', example: ''
  });
  const [showGachaDetails, setShowGachaDetails] = useState(false);
  const [showCoreShop, setShowCoreShop] = useState(false);

  // Missing States restored
  const [combatUI, setCombatUI] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [waveState, setWaveState] = useState({ currentWave: 1, currentIndex: 0, queue: [], shieldUsed: false });
  const [secretClicks, setSecretClicks] = useState(0);
  const [gachaState, setGachaState] = useState({ status: 'idle', displayRarity: 'N' });
  const [checkInMsg, setCheckInMsg] = useState(null);
  const [btnShake, setBtnShake] = useState(false);
  const clickTimeout = useRef(null);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [combo, setCombo] = useState(0);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [combatFx, setCombatFx] = useState(null);
  const [screenShake, setScreenShake] = useState(false);

  const showToast = (message, type = 'info') => { setToast({ visible: true, message, type }); setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000); };
  const triggerDamageNumber = (amount, isCrit, isHeal = false) => {
    const id = Date.now() + Math.random(); const offsetX = (Math.random() - 0.5) * 40;
    setDamageNumbers(prev => [...prev, { id, amount, isCrit, isHeal, offsetX }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1000);
  };
  const triggerFx = (type) => { setCombatFx(type); setTimeout(() => setCombatFx(null), 500); };
  const triggerScreenShake = () => { setScreenShake(true); setTimeout(() => setScreenShake(false), 300); };

  const TOTAL_ENEMIES = VOCAB_DATA.length + GRAMMAR_SORT_DATA.length + GRAMMAR_TYPE_DATA.length + READING_DATA.length + GRAMMAR_MCQ_DATA.length;
  const masteryObj = playerData.mastery || {};
  const masteredCount = Object.values(masteryObj).filter(c => c >= 3).length;
  const purificationRate = Math.floor((masteredCount / TOTAL_ENEMIES) * 100);

  const equippedVFX = VIRTUAL_GACHA_POOL.find(i => i.id === playerData.equipped?.vfx) || null;
  const equippedSkin = VIRTUAL_GACHA_POOL.find(i => i.id === playerData.equipped?.skin) || null;
  const equippedChip = VIRTUAL_GACHA_POOL.find(i => i.id === playerData.equipped?.chip) || null;

  const getActiveSet = () => {
    if (!equippedVFX || !equippedSkin || !equippedChip) return null;
    if (equippedVFX.set && equippedVFX.set === equippedSkin.set && equippedSkin.set === equippedChip.set) {
      return SET_BONUSES[equippedVFX.set] || null;
    }
    return null;
  };
  const activeSetBonus = getActiveSet();

  const getUnmastered = (pool, count) => {
    let unmastered = pool.filter(q => (masteryObj[q.id] || 0) < 3);
    unmastered = shuffle(unmastered);
    if (unmastered.length < count) {
      const mastered = shuffle(pool.filter(q => (masteryObj[q.id] || 0) >= 3));
      unmastered = [...unmastered, ...mastered.slice(0, count - unmastered.length)];
    }
    return unmastered.slice(0, count);
  };

  const loadEncounter = (encounter) => {
    if (!encounter) return;
    const baseTime = 60 + (equippedChip?.id === 'chip_cyber' ? 10 : 0);
    let uiState = { type: encounter.type, data: encounter.data, startTime: Date.now(), comboText: '', timeLeft: baseTime, readingStep: 0, inputValue: '' };
    if (encounter.type === 'mcq') {
      uiState.data = encounter.data;
    }
    if (encounter.type === 'vocab') {
      let options = [encounter.data.answers[0]];
      let wrongPool = shuffle(VOCAB_DATA.filter(v => v.id !== encounter.data.id)).map(v => v.answers[0]);
      options = shuffle([...options, ...wrongPool.slice(0, 3)]);
      uiState.data = { ...encounter.data, options };
    }
    if (encounter.type === 'sort') {
      uiState.slots = [null, null, null, null];
      uiState.data = { ...encounter.data, available: shuffle([...encounter.data.parts]) };
    }
    setCombatUI(uiState);
  };

  const startWaveRun = () => {
    sfx.init();
    const w1Vocab = getUnmastered(VOCAB_DATA, 4).map(q => ({ wave: 1, type: 'vocab', data: q }));
    const potionQ = Math.random() > 0.4 ? getUnmastered(POTION_DATA, 1).map(q => ({ wave: 1, type: 'potion', data: q })) : [];
    const w2Sort = getUnmastered(GRAMMAR_SORT_DATA, 2).map(q => ({ wave: 2, type: 'sort', data: q }));
    const w2Type = getUnmastered(GRAMMAR_TYPE_DATA, 1).map(q => ({ wave: 2, type: 'type', data: q }));
    const w2Mcq = getUnmastered(GRAMMAR_MCQ_DATA, 2).map(q => ({ wave: 2, type: 'mcq', data: q }));
    const w3Reading = getUnmastered(READING_DATA, 1).map(q => ({ wave: 3, type: 'reading', data: q }));
    const fullQueue = [...w1Vocab, ...potionQ, ...w2Sort, ...w2Type, ...w2Mcq, ...w3Reading];

    if (fullQueue.length === 0) return showToast("題庫為空或載入失敗！", "error");

    setPlayerData(prev => ({ ...prev, hp: prev.maxHp || 100 }));
    setCombo(0);
    setWaveState({ isActive: true, currentWave: 1, queue: fullQueue, currentIndex: 0, shieldUsed: false });
    setIsPaused(false);
    loadEncounter(fullQueue[0]);
    setScreen('battle');
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!auth) { setIsLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) { console.error("Auth Error", err); }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSubmit = async () => {
    setAuthError('');
    if (!emailInput || !passwordInput) {
      setAuthError('請輸入 Email 與密碼');
      return;
    }
    if (passwordInput.length < 6) {
      setAuthError('密碼長度至少需 6 個字元');
      return;
    }
    
    try {
      if (authMode === 'signup') {
        const currentData = { ...playerData };
        const userCred = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
        await setDoc(doc(db, 'saves', `${SAVE_ID}_${userCred.user.uid}`), currentData, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      }
      setShowAuthModal(false);
      setEmailInput('');
      setPasswordInput('');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setAuthError('此 Email 已經被註冊過了');
      else if (err.code === 'auth/invalid-credential') setAuthError('Email 或密碼錯誤');
      else setAuthError('發生錯誤：' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // signOut will trigger onAuthStateChanged with null, which will sign in anonymously again!
    } catch (err) { console.error("Logout Error", err); }
  };

  useEffect(() => {
    if (!callsign || !db) return;
    setIsLoading(true);
    const docRef = doc(db, 'saves', `${SAVE_ID}_${callsign}`);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        let loadedCrit = data.critRate || 5.0;
        if (loadedCrit < 1) loadedCrit = 5.0; // Migrate old 0.1 format
        setPlayerData({
          ...data,
          critRate: loadedCrit,
          lastLoginDate: data.lastLoginDate || '',
          readLogs: data.readLogs || [],
          mastery: data.mastery || {},
          killStreak: data.killStreak || 0,
          highestStreak: data.highestStreak || 0,
          league: data.league || DEFAULT_PLAYER_DATA.league
        });
      } else {
        setPlayerData(DEFAULT_PLAYER_DATA);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [callsign]);

  useEffect(() => {
    if (!playerData.league) return;
    const currentWeekId = getWeekId();
    if (playerData.league.weekId !== currentWeekId) {
      const allPlayers = [...playerData.league.bots, { name: '您 (You)', points: playerData.league.points }];
      allPlayers.sort((a, b) => b.points - a.points);
      const userRank = allPlayers.findIndex(p => p.name === '您 (You)');
      
      let newTier = playerData.league.tier;
      let msg = '';
      const tiers = ['青銅 (Bronze)', '白銀 (Silver)', '黃金 (Gold)', '菁英 (Elite)'];
      const currentTierIdx = tiers.indexOf(newTier);

      if (userRank < 3) {
        if (currentTierIdx < tiers.length - 1) {
          newTier = tiers[currentTierIdx + 1];
          msg = `【駭客聯盟結算】\n恭喜！您以第 ${userRank + 1} 名晉升至「${newTier}」階級！`;
        } else {
          msg = `【駭客聯盟結算】\n太強了！您以第 ${userRank + 1} 名蟬聯「菁英」霸主！`;
        }
      } else if (userRank >= 7) {
        if (currentTierIdx > 0) {
          newTier = tiers[currentTierIdx - 1];
          msg = `【駭客聯盟結算】\n結算排名第 ${userRank + 1}，不幸降級至「${newTier}」階級。`;
        } else {
          msg = `【駭客聯盟結算】\n結算排名第 ${userRank + 1}，請在青銅階級繼續努力。`;
        }
      } else {
         msg = `【駭客聯盟結算】\n結算排名第 ${userRank + 1}，成功保級於「${newTier}」。`;
      }

      alert(msg);
      
      const resetData = {
        ...playerData,
        league: { tier: newTier, points: 0, weekId: currentWeekId, bots: generateBots() }
      };
      saveGame(resetData);
    }
  }, [playerData.league?.weekId]);

  useEffect(() => {
    if (screen !== 'battle' || isPaused || feedback.show) return;
    
    if (combatUI.timeLeft > 0) {
      const timerId = setTimeout(() => {
        setCombatUI(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      const equippedChip = playerData.gachaPool?.find(i => i.isEquipped);
      let dmg = combatUI.type === 'boss' ? 30 : 15;

      if (equippedChip?.id === 'chip_ur1' && !waveState.shieldUsed && ((playerData.hp || 100) - dmg <= 0)) {
        setWaveState(prev => ({ ...prev, shieldUsed: true }));
        dmg = (playerData.hp || 100) - 1;
        showToast("🛡️ 量子鎖血晶片生效！強制保留 1 HP！", "success");
      }

      sfx.playError();
      setPlayerData(prev => ({ ...prev, hp: Math.max(0, (prev.hp || 100) - dmg) }));
      triggerScreenShake();
      setCombo(0);
      setFeedback({ show: true, isWrong: true, damageTaken: dmg, text: 'Boss 發動了超光速直擊！', correct: '時間耗盡', example: '請加快閱讀理解與作答反應速度。', exampleZh: '' });
      setCombatUI(prev => ({ ...prev, timeLeft: 60 }));
    }
  }, [combatUI.timeLeft, screen, combatUI.type, feedback.show, isPaused]);

  const handleSecretClick = () => { setSecretClicks(p => p + 1); if (clickTimeout.current) clearTimeout(clickTimeout.current); clickTimeout.current = setTimeout(() => setSecretClicks(0), 1000); };
  const saveGame = async (newData) => { setPlayerData(newData); if (callsign && db) await setDoc(doc(db, 'saves', `${SAVE_ID}_${callsign}`), newData, { merge: true }); };
  useEffect(() => {
    if (secretClicks >= 5) {
      saveGame({ ...playerData, gold: (playerData.gold || 0) + 5000, dataCores: (playerData.dataCores || 0) + 10 });
      showToast("⚠️【管理員模式】已注入 5000 G 與 10 顆資料核心！", "success");
      setSecretClicks(0);
    }
  }, [secretClicks]);



  useEffect(() => {
    if (!auth) { setIsLoading(false); return; }
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { print("Auth Error", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);
  const handleLoginSuccess = (enteredCallsign) => {
    setCallsign(enteredCallsign);
    setScreen('menu');
  };

  const handleNext = (newHp) => {
    if (newHp <= 0) {
      showToast("系統崩潰... 返回主終端機。", "error");
      saveGame({ ...playerData, hp: playerData.maxHp || 100 });
      setScreen('menu'); return;
    }
    const nextIndex = waveState.currentIndex + 1;
    if (nextIndex >= waveState.queue.length) {
      let earnedGold = 500;
      if (equippedSkin?.buff?.includes('金幣')) earnedGold += 100;
      if (activeSetBonus && activeSetBonus.name.includes('櫻華')) earnedGold = Math.floor(earnedGold * 1.4);
      if (equippedVFX?.id === 'vfx_ur1') earnedGold += 150;

      showToast(`🎉 區域肅清！獲得 ${earnedGold} G 學習津貼！`, "success");
      saveGame({ ...playerData, hp: playerData.maxHp || 100, gold: (playerData.gold || 0) + earnedGold, bossKills: (playerData.bossKills || 0) + 1 });
      setScreen('menu');
    } else {
      const nextEncounter = waveState.queue[nextIndex];
      let currentHp = newHp;
      if (activeSetBonus && activeSetBonus.name.includes('量子駭客')) {
        currentHp = Math.min(playerData.maxHp || 100, currentHp + 10);
      }
      setWaveState(prev => ({ ...prev, currentWave: nextEncounter.wave, currentIndex: nextIndex }));
      loadEncounter(nextEncounter);
    }
  };

  const processAnswer = (isCorrect, damageMod = 1, heal = 0, mistakeInfo = null) => {
    if (isPaused) return;
    let newPlayerData = { ...playerData };
    let pData = newPlayerData;
    const qId = combatUI.data?.id || 'unknown';
    const isHintUsed = battleState.isHintUsed;
    const enemyType = battleState.enemyType || 'normal';
    
    if (isCorrect) {
      const isCrit = Math.random() * 100 < newPlayerData.critRate;
      let damage = newPlayerData.atk + Math.floor(Math.random() * 5);
      let attackMsg = `直擊！造成 ${damage} 點數據傷害。`;
      if (isCrit) { damage *= 2; attackMsg = `【CRITICAL 爆擊！】核心直擊！造成 ${damage} 點巨額傷害。`; }

      const newEnemyHp = Math.max(0, battleState.enemyHp - damage);
      newPlayerData.ult = Math.min(newPlayerData.maxUlt, newPlayerData.ult + 10);

      if (!isHintUsed) {
        const currentStreak = newPlayerData.mastery[qId] || 0;
        newPlayerData.mastery = { ...newPlayerData.mastery, [qId]: currentStreak + 1 };
      }
      pData.hp = Math.min(pData.maxHp || 100, (pData.hp || 100) + heal);

      if (newEnemyHp <= 0) {
        if (enemyType === 'normal') newPlayerData.def += 1; else newPlayerData.atk += 2;
        
        if (newPlayerData.league) {
          newPlayerData.league.points += (enemyType === 'boss' ? 50 : 20);
          newPlayerData.league.bots = newPlayerData.league.bots.map(bot => {
            if (Math.random() > 0.4) return { ...bot, points: bot.points + Math.floor(Math.random() * 30) };
            return bot;
          });
        }

        newPlayerData.killStreak = (newPlayerData.killStreak || 0) + 1;
        newPlayerData.highestStreak = Math.max(newPlayerData.highestStreak || 0, newPlayerData.killStreak);

        if (newPlayerData.killStreak === 3) {
          setStreakAlert({ count: 3, title: '系統入侵者', color: 'text-blue-400' });
          setTimeout(() => setStreakAlert(null), 3000);
        } else if (newPlayerData.killStreak === 5) {
          setStreakAlert({ count: 5, title: '亂碼終結者', color: 'text-purple-400' });
          setTimeout(() => setStreakAlert(null), 3000);
        } else if (newPlayerData.killStreak >= 10 && newPlayerData.killStreak % 5 === 0) {
          setStreakAlert({ count: newPlayerData.killStreak, title: '神級駭客 (GODLIKE)', color: 'text-yellow-400' });
          setTimeout(() => setStreakAlert(null), 3000);
        }

        setBattleState(prev => ({ ...prev, enemyHp: 0, message: '協議解除成功！病毒已清除。(獲得數值成長)' }));
        setTimeout(() => setScreen('menu'), 1500);
      } else {
        triggerDamageNumber(damage, isCrit);
        if (isCrit || waveState.currentWave === 3) triggerScreenShake();
        if (combatUI.type === 'vocab') triggerFx('slash');
        else if (combatUI.type === 'sort') triggerFx('shield');
        else if (combatUI.type === 'type') triggerFx('magic');
        else triggerFx('slash');
      }
      saveGame(pData);
      if (mistakeInfo) {
        setTimeout(() => {
          setFeedback({ show: true, isWrong: false, damageTaken: 0, text: mistakeInfo.exp || '', correct: mistakeInfo.a || '', example: mistakeInfo.example || '', exampleZh: mistakeInfo.exampleZh || '' });
        }, 800);
      } else {
        setTimeout(() => handleNext(pData.hp), 800);
      }
    } else {
      const enemyAtk = enemyType === 'boss' ? 20 : 10;
      const damageTaken = Math.max(1, enemyAtk - Math.floor(newPlayerData.def / 2));
      newPlayerData.hp -= damageTaken;
      newPlayerData.killStreak = 0;
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

      if (equippedChip?.id === 'chip_ur1' && !waveState.shieldUsed && ((pData.hp || 100) - dmgTaken <= 0)) {
        setWaveState(prev => ({ ...prev, shieldUsed: true }));
        dmgTaken = Math.max(0, (pData.hp || 100) - 1);
        showToast("🛡️ 量子鎖血晶片發動！保全最後生命！", "success");
      }

      pData.hp = Math.max(0, (pData.hp || 100) - dmgTaken);
      if (combatUI.type !== 'potion' && combatUI.data) pData.mastery[combatUI.data.id] = 0;
      if (mistakeInfo) {
        const currentMistakes = pData.mistakes || [];
        if (!currentMistakes.find(m => m.q === mistakeInfo.q)) pData.mistakes = [mistakeInfo, ...currentMistakes].slice(0, 30);
      }
      saveGame(pData);
      setFeedback({ show: true, isWrong: true, damageTaken: dmgTaken, text: mistakeInfo?.exp || '指令錯誤', correct: mistakeInfo?.a || '', example: mistakeInfo?.example || '', exampleZh: mistakeInfo?.exampleZh || '' });
    }
  };

  const handleAcknowledgeFeedback = () => {
    setFeedback({ show: false });
    if (playerData.hp <= 0) {
      let resetData = { ...playerData, hp: playerData.maxHp, ult: 0 };
      saveGame(resetData);
      alert("機體損毀，重新啟動系統... (HP已恢復，但 ULT 能量已歸零)");
      setScreen('menu');
    } else {
      let accum = 0;
      let rand = Math.random() * 100;
      for (let item of pool) {
        accum += Number(item.chance);
        if (rand <= accum) { wonItem = item; break; }
      }
      if (!wonItem) wonItem = pool[0];
    }

    const isDup = (playerData.inventory || []).some(inv => inv?.id === wonItem.id);
    return { item: wonItem, rarity: wonItem.rarity, isDuplicate: isDup };
  };

  const executeGacha = (poolType = 'virtual', count = 1) => {
    sfx.init();
    if (gachaState.status !== 'idle') return;
    const singleCost = poolType === 'virtual' ? 300 : 500;
    const cost = count === 10 ? (singleCost * 9) : singleCost;

    if ((playerData.gold || 0) < cost) {
      setBtnShake(true);
      sfx.playError();
      setTimeout(() => setBtnShake(false), 500);
      return showToast(`金幣不足！需要 ${cost} G`, "error");
    }

    const currentBanner = BANNER_THEMES[activeBannerIdx];
    let tempPity = playerData.pityCount || 0;
    let results = [];
    let hasUR = false, hasSSR = false, hasR = false;

    for (let i = 0; i < count; i++) {
      if (count === 10 && i === 9 && !hasR && !hasSSR && !hasUR && poolType === 'virtual') {
        const rPool = VIRTUAL_GACHA_POOL.filter(item => item.rarity === 'R' || item.rarity === 'SSR' || item.rarity === 'UR');
        const forced = rPool[Math.floor(Math.random() * rPool.length)];
        const isDup = (playerData.inventory || []).some(inv => inv?.id === forced.id);
        results.push({ item: forced, rarity: forced.rarity, isDuplicate: isDup });
      } else {
        const res = rollSingleItem(poolType, tempPity, currentBanner);
        results.push(res);
        if (poolType === 'virtual') {
          if (res.rarity === 'UR' || res.rarity === 'SSR') {
            tempPity = 0;
          } else {
            tempPity += 1;
          }
        }
      }
      const lastR = results[results.length - 1].rarity;
      if (lastR === 'UR') hasUR = true;
      if (lastR === 'SSR') hasSSR = true;
      if (lastR === 'R') hasR = true;
    }

    const highestRarity = hasUR ? 'UR' : (hasSSR ? 'SSR' : (hasR ? 'R' : 'N'));

    const willUpgrade = (highestRarity === 'SSR' || highestRarity === 'UR') && Math.random() < 0.35;
    const initialDisplayRarity = willUpgrade ? (hasR ? 'R' : 'N') : highestRarity;

    setGachaState({
      status: 'charging',
      results,
      highestRarity,
      isUpgrade: willUpgrade,
      displayRarity: initialDisplayRarity
    });

    const chargeDuration = highestRarity === 'UR' ? 3000 : (highestRarity === 'SSR' ? 2400 : 1500);
    sfx.playCharge(chargeDuration / 1000);

    if (willUpgrade) {
      setTimeout(() => {
        sfx.playUpgradeGlitch();
        setGachaState(prev => ({ ...prev, status: 'upgrading', displayRarity: highestRarity }));
        triggerScreenShake();
      }, chargeDuration - 900);
    }

    setTimeout(() => {
      if (highestRarity === 'UR' || highestRarity === 'SSR') {
        sfx.playRareChime(highestRarity === 'UR');
      } else {
        sfx.playHit();
      }

      setGachaState(prev => ({ ...prev, status: 'revealed' }));

      let addedInventory = [...(playerData.inventory || [])];
      let gainedCores = 0;
      let refundGold = 0;

      const nowStr = new Date().toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      const newHistory = results.map((r, idx) => ({
        id: Date.now() + idx,
        item: r.item.item || r.item,
        rarity: r.rarity,
        date: nowStr
      }));

      if (poolType === 'virtual') {
        results.forEach(r => {
          if (r.isDuplicate) {
            refundGold += 100;
            gainedCores += (r.rarity === 'UR' ? 5 : (r.rarity === 'SSR' ? 3 : 1));
          } else {
            addedInventory.push(r.item);
          }
        });
      }

      saveGame({
        ...playerData,
        gold: (playerData.gold || 0) - cost + refundGold,
        inventory: addedInventory,
        pityCount: tempPity,
        dataCores: (playerData.dataCores || 0) + gainedCores,
        gachaHistory: [...newHistory, ...(playerData.gachaHistory || [])].slice(0, 60)
      });

      if (gainedCores > 0) {
        showToast(`重複裝備轉化：獲得 ${gainedCores} 顆資料核心 + ${refundGold} G！`, "info");
      }
    }, chargeDuration + 400);
  };

  const closeGacha = () => setGachaState({ status: 'idle', results: [], highestRarity: 'N', isUpgrade: false, displayRarity: 'N' });

  const handleExchangeCore = (item) => {
    const cost = item.rarity === 'UR' ? 15 : 8;
    if ((playerData.dataCores || 0) < cost) return showToast(`資料核心不足！需要 ${cost} 顆`, "error");
    const isOwned = (playerData.inventory || []).some(inv => inv?.id === item.id);
    if (isOwned) return showToast("你已經擁有此裝備！", "error");

    sfx.playRareChime(item.rarity === 'UR');
    saveGame({
      ...playerData,
      dataCores: playerData.dataCores - cost,
      inventory: [...(playerData.inventory || []), item]
    });
    showToast(`成功解析並解鎖：${item.item}！`, "success");
  };

  const getRarityConfig = (rarity) => {
    if (rarity === 'UR') return { color: 'text-rose-400', border: 'border-rose-500', bg: 'bg-rose-950', label: '🔥 UR 極致神話 🔥', shadow: 'shadow-[0_0_80px_rgba(244,63,94,0.9)]', ring1: 'border-rose-500', ring2: 'border-purple-500', badge: 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-[0_0_15px_rose]' };
    if (rarity === 'SSR') return { color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-950', label: '✨ SSR 特異大獎 ✨', shadow: 'shadow-[0_0_60px_rgba(250,204,21,0.8)]', ring1: 'border-yellow-500', ring2: 'border-red-500', badge: 'bg-yellow-500 text-black shadow-[0_0_10px_gold]' };
    if (rarity === 'R') return { color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-950', label: '🌟 R 階稀有 🌟', shadow: 'shadow-[0_0_40px_rgba(168,85,247,0.6)]', ring1: 'border-purple-500', ring2: 'border-fuchsia-500', badge: 'bg-purple-500 text-white' };
    return { color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-950', label: '📦 N 階量產型', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]', ring1: 'border-blue-500/50', ring2: 'border-cyan-500/50', badge: 'bg-blue-900 text-blue-200' };
  };

  const handleDailyCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    let newCritRate = playerData.critRate || 5.0;
    if (newCritRate < 1) newCritRate = 5.0; // Migrate old 0.1 format
    
    let message = "";
    let isReset = false;

    if (!playerData.lastLoginDate) {
      newCritRate += 1.0; message = "系統首次連線！爆擊率 +1.0%";
    } else {
      const diffDays = Math.ceil(Math.abs(new Date(today) - new Date(playerData.lastLoginDate)) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) { newCritRate += 1.0; message = "連續連線成功！爆擊率 +1.0%"; } 
      else if (diffDays >= 2) { newCritRate = 5.0; isReset = true; message = `中斷連線！加成歸零，爆擊率重置為 5.0%`; }
    }
    saveGame({ ...playerData, lastLoginDate: today, critRate: parseFloat(newCritRate.toFixed(1)) });
    setCheckInMsg({ text: message, isReset });
    setTimeout(() => setCheckInMsg(null), 3000);
  };

  const renderVFX = () => {
    if (!combatFx) return null;
    const vfxClass = equippedVFX ? equippedVFX.vfxClass : 'bg-white shadow-[0_0_20px_10px_rgba(6,182,212,0.8)]';
    const extraIcon = equippedVFX?.extra;

    if (combatFx === 'slash') return (
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 z-0 rounded-full flex items-center justify-center ${vfxClass}`} style={{ animation: 'slash-cut 0.4s ease-out forwards' }}>
        {extraIcon && <span className="absolute text-5xl animate-ping opacity-80" style={{ transform: 'rotate(30deg)' }}>{extraIcon}</span>}
      </div>
    );
    if (combatFx === 'shield') return <Hexagon size={150} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 ${equippedVFX ? equippedVFX.vfxClass.split(' ')[0].replace('bg-','text-') : 'text-cyan-400'}`} style={{ animation: 'shield-burst 0.5s ease-out forwards' }} />;
    if (combatFx === 'magic') return <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 bg-gradient-to-t from-transparent z-0 origin-bottom ${equippedVFX ? equippedVFX.vfxClass.split(' ')[0].replace('bg-','to-') : 'to-red-500'}`} style={{ height: '300px', animation: 'magic-pillar 0.5s ease-out forwards' }} />;
    if (combatFx === 'heal') return <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-500/20 rounded-full blur-xl z-0" style={{ animation: 'flash-white 0.5s ease-out forwards' }} />;
  };

  if (isLoading) return <div className="min-h-screen bg-gray-950 text-cyan-50 flex justify-center items-center">系統初始化中...</div>;
  const currentRarityConfig = getRarityConfig(gachaState.displayRarity);

  return (
    <div className="min-h-screen bg-gray-950 text-cyan-50 font-mono flex flex-col md:max-w-md md:mx-auto border-x border-cyan-900/50 shadow-2xl shadow-cyan-900/20 relative">
      <header className="bg-gray-900 p-4 border-b border-cyan-800 flex flex-col gap-2 z-10 relative shadow-md">
        <div className="flex justify-between items-center text-sm">
          <span className="text-cyan-400 font-bold flex items-center gap-1"><Terminal size={16}/> 語譯駭客 N4協議</span>
          <div className="flex items-center gap-2">
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-400 flex items-center gap-1"><UserCircle size={14}/> {user.email?.split('@')[0]}</span>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-400" title="登出"><LogOut size={14}/></button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-1 text-xs bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-800 px-2 py-1 rounded text-cyan-300 transition-colors">
                <UserCircle size={14}/> 訪客 (綁定帳號)
              </button>
            )}
            <span className="text-xs text-gray-600">[{user ? user.uid.substring(0,4) : 'OFF'}]</span>
          </div>
        </div>
      </header>

      {/* --- 抽卡動態展示 (支援 10 連與變色昇格) --- */}
      <GachaModal
        gachaState={gachaState}
        currentRarityConfig={currentRarityConfig}
        getRarityConfig={getRarityConfig}
        closeGacha={closeGacha}
      />

      {/* --- Header --- */}
      <header className="bg-gray-900 p-4 border-b border-cyan-800 flex flex-col gap-2 z-10 shrink-0">
        <div className="flex justify-between items-center text-sm">
          <div className="flex flex-col">
            <span className="text-cyan-400 font-bold flex items-center gap-1"><Terminal size={16}/> N4 語譯駭客</span>
            {callsign && <span className="text-xs text-gray-500 font-mono">CALLSIGN: {callsign}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setSoundEnabled(!soundEnabled); sfx.enabled = !soundEnabled; }} className="text-gray-400 hover:text-white p-1">
              {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
            </button>
            <span className="text-rose-400 text-xs font-bold bg-rose-950/60 px-2 py-1 rounded border border-rose-800"><Hexagon size={12} className="inline mr-1"/>{playerData.dataCores || 0}</span>
            <span className="text-yellow-400 font-bold"><Coins size={14} className="inline"/> {playerData.gold || 0} G</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-xs w-6">HP</span>
          <div className="flex-1 bg-gray-800 h-3 rounded-full overflow-hidden border border-red-900 relative">
            <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${(Math.max(0, playerData.hp || 0) / (playerData.maxHp || 100)) * 100}%` }}></div>
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

      {streakAlert && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div className={`animate-in zoom-in spin-in-12 duration-500 text-center ${streakAlert.color} drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]`}>
            <div className="text-6xl font-black italic mb-2">{streakAlert.count} 連殺!</div>
            <div className="text-4xl font-bold tracking-widest bg-gray-900/80 px-6 py-2 rounded-xl border border-current">
              {streakAlert.title}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 flex flex-col relative z-0">
        
        {screen === 'login' && (
          <LoginScreen onLogin={handleLoginSuccess} />
        )}

        {screen === 'menu' && (
          <div className="flex-1 flex flex-col p-4 gap-4 justify-center">

            <div className="bg-gray-900/80 p-5 rounded-xl border border-cyan-800 shadow-inner flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-cyan-400 font-black text-sm tracking-wider">
                  <span className="flex items-center gap-1"><Target size={16}/> 世界淨化進度</span>
                  <span className="animate-pulse">{purificationRate}%</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-cyan-900/50 relative shadow-inner">
                  <div className="h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_10px_cyan] rounded-full" style={{ width: `${purificationRate}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <button onClick={() => setShowDetailedProgress(!showDetailedProgress)} className="text-[10px] text-cyan-500 hover:text-cyan-300 font-bold underline cursor-pointer">{showDetailedProgress ? '隱藏詳細資訊' : '詳細資訊'}</button>
                  <div className="text-[10px] text-gray-500 font-bold">已掌握節點: {masteredCount} / {TOTAL_ENEMIES}</div>
                </div>
                {showDetailedProgress && (
                  <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 text-xs text-gray-400 flex flex-col gap-1 mt-2 animate-in slide-in-from-top-2">
                    <div className="flex justify-between"><span>單字 (Vocab)</span><span>{Object.values(masteryObj).filter((c, i) => c >= 3 && VOCAB_DATA.find(q => q.id === Object.keys(masteryObj)[i])).length} / {VOCAB_DATA.length}</span></div>
                    <div className="flex justify-between"><span>文法重組 (Sort)</span><span>{Object.values(masteryObj).filter((c, i) => c >= 3 && GRAMMAR_SORT_DATA.find(q => q.id === Object.keys(masteryObj)[i])).length} / {GRAMMAR_SORT_DATA.length}</span></div>
                    <div className="flex justify-between"><span>文法變化 (Type)</span><span>{Object.values(masteryObj).filter((c, i) => c >= 3 && GRAMMAR_TYPE_DATA.find(q => q.id === Object.keys(masteryObj)[i])).length} / {GRAMMAR_TYPE_DATA.length}</span></div>
                    <div className="flex justify-between"><span>文法選擇 (MCQ)</span><span>{Object.values(masteryObj).filter((c, i) => c >= 3 && GRAMMAR_MCQ_DATA.find(q => q.id === Object.keys(masteryObj)[i])).length} / {GRAMMAR_MCQ_DATA.length}</span></div>
                    <div className="flex justify-between"><span>閱讀 (Reading)</span><span>{Object.values(masteryObj).filter((c, i) => c >= 3 && READING_DATA.find(q => q.id === Object.keys(masteryObj)[i])).length} / {READING_DATA.length}</span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-lg border border-cyan-800 shadow-inner">
              <h2 className="text-center text-cyan-300 font-bold mb-4 border-b border-cyan-800 pb-2">駭客機體狀態</h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2 text-red-300"><Zap size={16}/> 攻擊力: {playerData.atk}</div>
                <div className="flex items-center gap-2 text-blue-300"><Shield size={16}/> 防火牆: {playerData.def}</div>
                <div className="flex items-center gap-2 text-purple-300"><Target size={16}/> 連殺: {playerData.killStreak || 0}</div>
                <div className="flex items-center gap-2 text-gray-400"><Target size={16}/> 最高: {playerData.highestStreak || 0}</div>
                <div className="flex items-center gap-2 text-yellow-300 col-span-2 justify-center bg-yellow-900/20 p-2 rounded border border-yellow-900/50">
                  <Zap size={16}/> 核心爆擊率: {playerData.critRate.toFixed(1)}%
                </div>
              </div>

              <div className="w-full h-px bg-cyan-900/30"></div>

              <div className="grid grid-cols-2 gap-2 text-sm text-center">
                <div className="bg-gray-800/50 p-2 rounded text-red-300 border border-gray-700/50">攻 {playerData.atk || 10}</div>
                <div className="bg-gray-800/50 p-2 rounded text-blue-300 border border-gray-700/50">防 {playerData.def || 5}</div>
              </div>
              <button onClick={handleDailyCheckIn} disabled={playerData.lastLoginDate === new Date().toISOString().split('T')[0]} className={`w-full p-4 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${playerData.lastLoginDate === new Date().toISOString().split('T')[0] ? 'bg-gray-800 text-gray-500 border border-gray-700' : 'bg-green-700/50 hover:bg-green-600/60 border border-green-500 text-green-100 animate-pulse'}`}>
                <CalendarCheck size={18} />
                {playerData.lastLoginDate === getTodayString() ? '今日已連線' : '每日連線 (+1.0% 爆擊)'}
              </button>
            </div>

            <button onClick={startWaveRun} disabled={purificationRate >= 100} className={`bg-cyan-900/50 border border-cyan-400 p-6 rounded-xl flex items-center justify-center gap-3 text-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 transition-transform ${purificationRate >= 100 ? 'opacity-50' : ''}`}>
              <Play size={28} /> {purificationRate >= 100 ? '全區域肅清完畢' : '進入作戰 (HP全滿)'}
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setScreen('league')} className="col-span-2 bg-yellow-900/30 hover:bg-yellow-800/40 border border-yellow-500/50 p-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-colors">
                <Target size={20} className="text-yellow-400"/>
                <span className="text-sm font-bold text-yellow-200">駭客聯盟 (每週排行)</span>
              </button>
              <button onClick={() => setScreen('reading')} className="bg-purple-900/30 border border-purple-500/50 p-4 rounded-xl flex flex-col items-center gap-2 active:scale-95">
                <BookOpen size={20} className="text-purple-400"/>
                <span className="text-sm">解密日誌</span>
              </button>
              <button onClick={() => setScreen('records')} className="bg-orange-900/30 border border-orange-500/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                <Database className="text-orange-400"/> <span className="text-xs font-bold">錯誤日誌</span>
              </button>
            </div>
          </div>
        )}

        {/* --- 裝備庫 --- */}
        {screen === 'loadout' && (
          <div className="flex-1 p-4 flex flex-col h-full bg-gray-950">
            <h2 className="text-blue-400 font-black text-2xl mb-2 flex items-center gap-2 shrink-0"><Backpack /> 虛擬裝備圖鑑</h2>

            <div className="mb-4 bg-gray-900 border border-gray-800 p-3 rounded-xl">
              <div className="text-xs text-gray-400 font-bold mb-1 flex items-center gap-1">
                <Layers size={14}/> 當前套裝共鳴狀態：
              </div>
              {activeSetBonus ? (
                <div className="text-xs text-cyan-300 font-bold">
                  {activeSetBonus.name}：<span className="text-gray-300 font-normal">{activeSetBonus.desc}</span>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  未啟動共鳴（同系列裝備滿 3 件時啟動專屬學習加成）
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-6 pb-4">
              
              {/* 戰術晶片區塊 */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end border-b border-gray-800 pb-2">
                  <h3 className="text-gray-400 font-bold flex items-center gap-1"><Zap size={16}/> 戰術輔助晶片</h3>
                  <span className="text-xs font-bold text-cyan-500 bg-cyan-950 px-2 py-1 rounded">收集度: {(playerData.inventory || []).filter(i => i?.type === 'chip').length}/{VIRTUAL_GACHA_POOL.filter(i => i.type === 'chip').length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div onClick={() => saveGame({...playerData, equipped: {...playerData.equipped, chip: null}})} className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer ${!playerData.equipped?.chip ? 'border-cyan-400 bg-cyan-950/30' : 'border-gray-800 bg-gray-900'}`}>
                     <span className="font-bold">【未裝備晶片】</span>
                     {!playerData.equipped?.chip && <CheckCircle2 className="text-cyan-400" />}
                  </div>

                  {VIRTUAL_GACHA_POOL.filter(i => i.type === 'chip').map((item, i) => {
                    const isOwned = (playerData.inventory || []).some(inv => inv?.id === item.id);
                    const isEquipped = playerData.equipped?.chip === item.id;
                    if (!isOwned) return (
                      <div key={i} className="p-4 rounded-xl border-2 border-gray-800 bg-gray-900/50 flex justify-between items-center opacity-50 grayscale select-none">
                         <span className="font-bold text-gray-500">【???】未解鎖晶片</span>
                         <div className="flex items-center gap-1 text-xs font-bold bg-gray-800 px-2 py-1 rounded"><Lock size={12}/> {item.rarity}</div>
                      </div>
                    );

                    return (
                      <div key={i} onClick={() => saveGame({...playerData, equipped: {...playerData.equipped, chip: item.id}})} className={`p-4 rounded-xl border-2 flex flex-col gap-2 cursor-pointer transition-colors ${isEquipped ? 'border-cyan-400 bg-cyan-950/30' : 'border-gray-700 bg-gray-800'}`}>
                         <div className="flex items-center justify-between">
                           <span className={`font-bold ${getRarityConfig(item.rarity).color}`}>{item.item}</span>
                           {isEquipped && <CheckCircle2 className="text-cyan-400" />}
                         </div>
                         {item.buff && <div className="text-xs text-yellow-300 bg-yellow-950/30 px-2 py-1 rounded w-fit border border-yellow-900/50">🔥 {item.buff}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 特效區塊 */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end border-b border-gray-800 pb-2">
                  <h3 className="text-gray-400 font-bold">⚔️ 攻擊特效</h3>
                  <span className="text-xs font-bold text-cyan-500 bg-cyan-950 px-2 py-1 rounded">收集度: {(playerData.inventory || []).filter(i => i?.type === 'vfx').length}/{VIRTUAL_GACHA_POOL.filter(i => i.type === 'vfx').length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div onClick={() => saveGame({...playerData, equipped: {...playerData.equipped, vfx: 'default'}})} className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer ${playerData.equipped?.vfx === 'default' ? 'border-cyan-400 bg-cyan-950/30' : 'border-gray-800 bg-gray-900'}`}>
                     <span className="font-bold">【預設】標準光斬</span>
                     {playerData.equipped?.vfx === 'default' && <CheckCircle2 className="text-cyan-400" />}
                  </div>

                  {VIRTUAL_GACHA_POOL.filter(i => i.type === 'vfx').map((item, i) => {
                    const isOwned = (playerData.inventory || []).some(inv => inv?.id === item.id);
                    const isEquipped = playerData.equipped?.vfx === item.id;
                    if (!isOwned) return (
                      <div key={i} className="p-4 rounded-xl border-2 border-gray-800 bg-gray-900/50 flex justify-between items-center opacity-50 grayscale select-none">
                         <span className="font-bold text-gray-500">【???】未解鎖特效</span>
                         <div className="flex items-center gap-1 text-xs font-bold bg-gray-800 px-2 py-1 rounded"><Lock size={12}/> {item.rarity}</div>
                      </div>
                    );

                    return (
                      <div key={i} onClick={() => saveGame({...playerData, equipped: {...playerData.equipped, vfx: item.id}})} className={`p-4 rounded-xl border-2 flex flex-col gap-2 cursor-pointer transition-colors ${isEquipped ? 'border-cyan-400 bg-cyan-950/30' : 'border-gray-700 bg-gray-800'}`}>
                         <div className="flex items-center justify-between">
                           <span className={`font-bold ${getRarityConfig(item.rarity).color}`}>{item.item}</span>
                           {isEquipped && <CheckCircle2 className="text-cyan-400" />}
                         </div>
                         {item.buff && <div className="text-xs text-yellow-300 bg-yellow-950/30 px-2 py-1 rounded w-fit border border-yellow-900/50">🔥 {item.buff}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 外觀區塊 */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end border-b border-gray-800 pb-2">
                  <h3 className="text-gray-400 font-bold">👾 怪物外觀</h3>
                  <span className="text-xs font-bold text-cyan-500 bg-cyan-950 px-2 py-1 rounded">收集度: {(playerData.inventory || []).filter(i => i?.type === 'skin').length}/{VIRTUAL_GACHA_POOL.filter(i => i.type === 'skin').length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div onClick={() => saveGame({...playerData, equipped: {...playerData.equipped, skin: 'default'}})} className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer ${playerData.equipped?.skin === 'default' ? 'border-cyan-400 bg-cyan-950/30' : 'border-gray-800 bg-gray-900'}`}>
                     <span className="font-bold">【預設】病毒史萊姆</span>
                     {playerData.equipped?.skin === 'default' && <CheckCircle2 className="text-cyan-400" />}
                  </div>

                  {VIRTUAL_GACHA_POOL.filter(i => i.type === 'skin').map((item, i) => {
                    const isOwned = (playerData.inventory || []).some(inv => inv?.id === item.id);
                    const isEquipped = playerData.equipped?.skin === item.id;
                    if (!isOwned) return (
                      <div key={i} className="p-4 rounded-xl border-2 border-gray-800 bg-gray-900/50 flex justify-between items-center opacity-50 grayscale select-none">
                         <span className="font-bold text-gray-500">【???】未解鎖外觀</span>
                         <div className="flex items-center gap-1 text-xs font-bold bg-gray-800 px-2 py-1 rounded"><Lock size={12}/> {item.rarity}</div>
                      </div>
                    );

                    return (
                      <div key={i} onClick={() => saveGame({...playerData, equipped: {...playerData.equipped, skin: item.id}})} className={`p-4 rounded-xl border-2 flex flex-col gap-2 cursor-pointer transition-colors ${isEquipped ? 'border-cyan-400 bg-cyan-950/30' : 'border-gray-700 bg-gray-800'}`}>
                         <div className="flex items-center justify-between">
                           <span className={`font-bold ${getRarityConfig(item.rarity).color}`}>{item.item}</span>
                           {isEquipped && <CheckCircle2 className="text-cyan-400" />}
                         </div>
                         {item.buff && <div className="text-xs text-yellow-300 bg-yellow-950/30 px-2 py-1 rounded w-fit border border-yellow-900/50">🔥 {item.buff}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-900 shrink-0 mt-auto">
               <button onClick={() => setScreen('menu')} className="w-full bg-gray-800 hover:bg-gray-700 p-5 rounded-2xl font-black text-lg active:scale-95 transition-transform">返回終端機</button>
            </div>
          </div>
        )}

        {/* --- 戰鬥畫面 --- */}
        {screen === 'battle' && combatUI.data && (
           <div className="flex-1 flex flex-col p-4 relative overflow-hidden">
             <div className="flex justify-between items-center text-xs text-gray-500 mb-2 bg-gray-900 px-3 py-2 rounded-full border border-gray-800 shadow-sm z-10">
               <div className="flex items-center gap-2">
                 <span className="font-bold text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full">WAVE {waveState.currentWave} / 3</span>
                 <span>進度 {waveState.currentIndex + 1} / {waveState.queue.length}</span>
               </div>
               <button onClick={() => setIsPaused(true)} disabled={feedback.show} className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full text-gray-300 active:scale-90 transition-transform disabled:opacity-50"><Pause size={18} /></button>
             </div>

             <div className="absolute top-16 right-4 flex flex-col items-end z-10 pointer-events-none transition-all duration-300">
               {combo > 1 && (<div className={`font-black italic transition-all duration-200 ${getComboStyle()}`}><span className="text-3xl">{combo}</span> <span className="text-sm">COMBO</span></div>)}
             </div>

             <div className={`flex-1 flex flex-col transition-opacity duration-300 ${isPaused || feedback.show ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
               <div className="relative flex flex-col items-center justify-center my-auto min-h-[160px]">
                 {renderVFX()}

                 <div className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center text-6xl border-4 shadow-xl transition-all duration-300 ${waveState.currentWave === 3 ? 'bg-red-950 border-red-500 text-red-500 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-gray-800 border-cyan-700 text-cyan-400'}`}>
                   {renderMonsterEmoji()}
                   {damageNumbers.map(d => (
                     <div key={d.id} className={`absolute font-black pointer-events-none drop-shadow-md flex items-center gap-1 ${d.isHeal ? 'text-green-400 text-3xl' : (d.isCrit ? 'text-yellow-400 text-4xl' : 'text-white text-2xl')}`} style={{ left: `calc(50% + ${d.offsetX}px)`, top: '10%', animation: 'damage-float 1s ease-out forwards' }}>
                       {d.isCrit && '💥'} {d.amount}
                     </div>
                   ))}
                 </div>

                 {waveState.currentWave === 3 && combatUI.type === 'reading' && (
                   <div className="flex items-center gap-2 text-red-400 font-bold bg-red-950/80 px-5 py-2 rounded-full text-xl mt-4 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] z-10">
                     <Clock size={20} className={isPaused || feedback.show ? '' : 'animate-spin'} /> {combatUI.timeLeft}s
                   </div>
                 )}
               </div>

               <div className="flex-1 flex flex-col justify-end gap-4 pb-4">
                 {combatUI.type === 'vocab' && (
                   <div className="animate-in slide-in-from-bottom-4">
                     <div className="text-center text-5xl font-black mb-8 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] leading-loose pt-4"><RubyText text={combatUI.data.ch} showRuby={false} /></div>
                     <div className="grid grid-cols-2 gap-3">
                       {(combatUI.data.options || []).map((opt, i) => (<button key={i} onClick={() => handleVocabClick(opt)} className="bg-gray-800 border-2 border-cyan-900 p-5 rounded-xl text-xl active:bg-cyan-900 active:scale-95 transition-transform font-bold"><RubyText text={opt} showRuby={false} /></button>))}
                     </div>
                   </div>
                 )}
                 {combatUI.type === 'sort' && (
                   <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
                     <div className="text-center text-gray-300 text-xl font-bold bg-gray-900/50 p-3 rounded-lg leading-loose"><RubyText text={combatUI.data.context} showRuby={false} /></div>
                     <div className="flex justify-center gap-2">
                       {combatUI.slots.map((slot, i) => (<button key={`s${i}`} onClick={() => handleSortClick(slot, false, i)} className={`w-20 h-16 rounded-lg border-2 flex items-center justify-center text-sm transition-all leading-loose ${slot ? 'bg-cyan-900 border-cyan-400 text-white font-bold scale-105' : 'border-dashed border-gray-600 bg-gray-900'}`}><RubyText text={slot} showRuby={false}/></button>))}
                     </div>
                     <div className="grid grid-cols-2 gap-3 mt-4">
                       {(combatUI.data.available || []).map((part, i) => (<button key={`a${i}`} onClick={() => handleSortClick(part, true, i)} disabled={!part} className={`p-4 rounded-xl border-2 text-sm font-bold transition-transform leading-loose ${part ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 active:scale-90' : 'bg-transparent border-transparent text-transparent scale-90'}`}><RubyText text={part || '已填入'} showRuby={false} /></button>))}
                     </div>
                   </div>
                 )}
                 {combatUI.type === 'type' && (
                   <form onSubmit={handleTypeSubmit} className="flex flex-col gap-4 animate-in slide-in-from-bottom-4">
                     <div className="text-center text-xl font-bold bg-gray-900 p-4 rounded-lg border border-gray-700 leading-loose"><RubyText text={combatUI.data.prompt} showRuby={false} /></div>
                     <input type="text" value={combatUI.inputValue} onChange={e => setCombatUI(prev => ({ ...prev, inputValue: e.target.value }))} placeholder="輸入正確變化..." className="bg-gray-800 border-2 border-cyan-700 rounded-xl p-5 text-center text-2xl focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] w-full transition-all" autoFocus />
                     <button type="submit" className="bg-cyan-700 text-white p-5 rounded-xl font-black text-xl flex items-center justify-center gap-2 active:bg-cyan-600 active:scale-95 transition-transform shadow-lg"><FastForward /> 詠唱發射</button>
                   </form>
                 )}
                 {combatUI.type === 'mcq' && (
                   <div className="flex flex-col h-full animate-in zoom-in-95">
                     <div className="text-center text-lg font-bold mb-auto mt-4 px-4 bg-gray-900/50 p-4 rounded-lg leading-loose whitespace-pre-wrap"><RubyText text={combatUI.data.question} showRuby={false} /></div>
                     <div className="grid grid-cols-1 gap-2 mt-4">
                       {combatUI.data.options.map((opt, idx) => (
                         <button key={idx} onClick={() => handleMcqClick(idx)} className="bg-gray-800 border-2 border-cyan-900/50 hover:border-cyan-500 p-4 rounded-xl text-left active:bg-cyan-900 active:scale-95 transition-all font-bold">
                           <RubyText text={opt} showRuby={false} />
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
                 {combatUI.type === 'potion' && (
                   <div className="flex flex-col h-full animate-in zoom-in-95">
                     <div className="text-center text-xl font-bold mb-auto mt-4 px-4 bg-gray-900/50 p-4 rounded-lg leading-loose"><RubyText text={combatUI.data.context} showRuby={false} /></div>
                     <div className="flex gap-4 mt-8">
                       <button onClick={() => handlePotionClick(0)} className="flex-1 bg-red-900/40 border-2 border-red-500/50 p-8 rounded-2xl flex flex-col items-center gap-2 active:bg-red-800/60 active:scale-90 transition-transform"><span className="text-2xl font-bold"><RubyText text={combatUI.data.options[0]} showRuby={false} /></span></button>
                       <button onClick={() => handlePotionClick(1)} className="flex-1 bg-blue-900/40 border-2 border-blue-500/50 p-8 rounded-2xl flex flex-col items-center gap-2 active:bg-blue-800/60 active:scale-90 transition-transform"><span className="text-2xl font-bold"><RubyText text={combatUI.data.options[1]} showRuby={false} /></span></button>
                     </div>
                   </div>
                 )}
                 {combatUI.type === 'reading' && (
                   <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] animate-in fade-in">
                     <div className="bg-gray-900 border border-red-900/50 p-5 rounded-xl text-base text-gray-200 leading-[2.5] shadow-inner"><RubyText text={combatUI.data.text} showRuby={false} /></div>
                     <div className="bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-700">
                       <p className="font-bold text-cyan-200 text-lg mb-5 leading-loose"><RubyText text={combatUI.data.questions[combatUI.readingStep].q} showRuby={false} /></p>
                       <div className="flex flex-col gap-3">
                         {combatUI.data.questions[combatUI.readingStep].options.map((opt, i) => (<button key={i} onClick={() => handleReadingClick(i)} className="p-4 rounded-xl border-2 border-gray-600 bg-gray-900 text-left hover:bg-gray-800 active:scale-95 transition-transform font-bold leading-loose"><RubyText text={opt} showRuby={false} /></button>))}
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>

             {/* 回饋彈窗 */}
             {feedback.show && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className={`bg-gray-900 border-2 ${feedback.isWrong ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]'} rounded-3xl w-full max-w-sm flex flex-col overflow-hidden max-h-[90vh]`}>
                  <div className={`${feedback.isWrong ? 'bg-red-950 border-red-900' : 'bg-green-950 border-green-900'} p-6 border-b text-center shrink-0 flex flex-col items-center`}>
                    {feedback.isWrong ? (
                      <AlertTriangle className="text-red-500 mb-2 animate-pulse" size={40} />
                    ) : (
                      <CheckCircle2 className="text-green-500 mb-2 animate-pulse" size={40} />
                    )}
                    <h3 className={`font-black ${feedback.isWrong ? 'text-red-400' : 'text-green-400'} text-xl`}>
                      {feedback.isWrong ? `防線突破！受到 ${feedback.damageTaken} 傷害` : '解析成功！'}
                    </h3>
                  </div>
                  <div className="p-6 flex flex-col gap-5 overflow-y-auto whitespace-pre-wrap">
                    {feedback.correct && (<div><span className="text-sm text-gray-400 font-bold block mb-2">🎯 {feedback.isWrong ? '正確防禦指令' : '防禦指令'}</span><div className="text-2xl font-black text-green-400 bg-green-950/30 p-4 rounded-xl border border-green-900/50 leading-loose"><RubyText text={feedback.correct} showRuby={true} /></div></div>)}
                    {feedback.text && (<div><span className="text-sm text-gray-400 font-bold block mb-2">📝 漏洞解析</span><div className="text-lg text-gray-200 bg-gray-800 p-4 rounded-xl leading-[1.8]"><RubyText text={feedback.text} showRuby={true} /></div></div>)}
                    {feedback.example && (
                      <div>
                        <span className="text-sm text-gray-400 font-bold block mb-2">🗣️ 應用範例</span>
                        <div className="text-lg text-yellow-300 bg-yellow-950/30 p-4 rounded-xl border border-yellow-900/50 leading-loose">
                          <RubyText text={feedback.example} showRuby={true} />
                          {feedback.exampleZh && <div className="text-sm text-gray-400 mt-2 font-normal border-t border-yellow-900/30 pt-2">{feedback.exampleZh}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={handleAcknowledgeFeedback} className="bg-cyan-800 hover:bg-cyan-700 text-white p-6 font-black active:bg-cyan-600 text-xl shrink-0 rounded-b-2xl border-t border-cyan-700 transition-colors">確認並前進</button>
                </div>
              </div>
            )}

            {isPaused && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-gray-900 border-2 border-cyan-700 rounded-3xl w-full max-w-sm flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                  <div className="bg-cyan-950 p-6 border-b border-cyan-900 text-center flex flex-col items-center gap-3">
                    <Pause className="text-cyan-400 animate-pulse" size={40} />
                    <h3 className="font-black text-cyan-200 text-2xl tracking-widest">系統暫停中</h3>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    <button onClick={handleResume} className="bg-cyan-700 hover:bg-cyan-600 text-white p-5 rounded-xl font-bold flex justify-center gap-2 active:scale-95 transition-transform text-lg"><PlayCircle size={24} /> 繼續戰鬥</button>
                    <button onClick={handleRestartBattle} className="bg-gray-800 border border-gray-600 text-gray-200 p-5 rounded-xl font-bold flex justify-center gap-2 active:scale-95 transition-transform text-lg"><RotateCcw size={24} /> 重新挑戰 (免扣血)</button>
                    <div className="w-full h-px bg-gray-800 my-2"></div>
                    <button onClick={handleSurrender} className="bg-red-950 border border-red-800 text-red-400 p-5 rounded-xl font-bold flex justify-center gap-2 active:scale-95 transition-transform text-lg"><XOctagon size={24} /> 放棄並撤退 (無懲罰)</button>
                  </div>
                </div>
              </div>
            )}
           </div>
        )}

        {/* --- 商城 --- */}
        {screen === 'shop' && (
          <div className="flex-1 flex flex-col h-full bg-gray-950">
            <div className="p-4 bg-gray-900 border-b border-gray-800 shrink-0 relative">
              <h2 onClick={handleSecretClick} className="text-yellow-400 font-black text-2xl flex items-center gap-2 cursor-pointer select-none"><ShoppingCart /> 獎勵商城</h2>
              <div className="absolute right-4 top-4 flex items-center gap-3">
                <span className="text-rose-400 text-xs font-bold bg-rose-950/60 px-2.5 py-1.5 rounded-lg border border-rose-800">{playerData.dataCores || 0} 核心</span>
                <span className="text-2xl text-yellow-400 font-bold bg-yellow-900/30 px-3 py-1 rounded-lg">{playerData.gold || 0} <span className="text-sm">G</span></span>
              </div>
            </div>

            <div className="flex border-b border-gray-800 shrink-0">
              <button onClick={() => setShopTab('gacha')} className={`flex-1 p-4 text-base font-bold flex justify-center gap-2 transition-colors ${shopTab === 'gacha' ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500'}`}><Gift size={20}/> 抽獎</button>
              <button onClick={() => setShopTab('settings')} className={`flex-1 p-4 text-base font-bold flex justify-center gap-2 transition-colors ${shopTab === 'settings' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500'}`}><Settings size={20}/> 設定</button>
              <button onClick={() => setShopTab('history')} className={`flex-1 p-4 text-base font-bold flex justify-center gap-2 transition-colors ${shopTab === 'history' ? 'bg-gray-800 text-orange-400 border-b-2 border-orange-400' : 'text-gray-500'}`}><History size={20}/> 紀錄</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col relative">
              {shopTab === 'gacha' && (
                <div className="flex flex-col h-full gap-6 pb-4">

                  {/* 輪替卡池橫幅選擇 */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {BANNER_THEMES.map((theme, idx) => (
                      <button
                        key={theme.id}
                        onClick={() => setActiveBannerIdx(idx)}
                        className={`text-xs px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors border ${activeBannerIdx === idx ? 'bg-blue-600/40 border-blue-400 text-white' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                      >
                        {theme.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* 虛擬卡池 */}
                  <div className="bg-gray-900/60 p-5 rounded-3xl border border-blue-900/40 shadow-inner flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-blue-200 font-black text-base">{BANNER_THEMES[activeBannerIdx].name}</h3>
                        <p className="text-[11px] text-gray-400">{BANNER_THEMES[activeBannerIdx].desc}</p>
                      </div>
                      <button onClick={() => setShowCoreShop(true)} className="text-xs bg-rose-950 text-rose-300 border border-rose-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-rose-900 shrink-0">
                        <Hexagon size={12} /> 天井兌換所
                      </button>
                    </div>

                    {/* 保底進度條 */}
                    <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-400">SSR / UR 保底進度</span>
                        <span className="text-yellow-400 font-black">剩餘 {30 - (playerData.pityCount || 0)} 抽必得</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-yellow-400 transition-all duration-300" style={{ width: `${((playerData.pityCount || 0) / 30) * 100}%` }}></div>
                      </div>
                      <div className="text-[10px] text-gray-500 flex justify-between">
                        <span>第 20 抽起進入軟保底概率狂飆</span>
                        <span>目前累計: {playerData.pityCount || 0} 抽</span>
                      </div>
                    </div>

                    <button onClick={() => setShowGachaDetails('virtual')} className="flex items-center justify-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                      <Search size={14}/> 查看內容物、機率與保底說明
                    </button>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button onClick={() => executeGacha('virtual', 1)} disabled={gachaState.status !== 'idle'} className="bg-blue-700 hover:bg-blue-600 text-white font-black p-4 rounded-xl active:scale-95 flex flex-col items-center gap-1">
                        <span>單次解析</span>
                        <span className="text-xs font-normal bg-black/30 px-3 py-0.5 rounded-full">300 G</span>
                      </button>
                      <button onClick={() => executeGacha('virtual', 10)} disabled={gachaState.status !== 'idle'} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black p-4 rounded-xl active:scale-95 flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(147,51,234,0.4)] relative">
                        <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.2 rounded-full absolute -top-2 right-2 font-black">9折保底R</span>
                        <span>十連重構</span>
                        <span className="text-xs font-normal bg-black/30 px-3 py-0.5 rounded-full">2700 G</span>
                      </button>
                    </div>
                  </div>

                  {/* 實體犒賞卡池 */}
                  <div className="bg-gray-900/60 p-5 rounded-3xl border border-yellow-900/40 shadow-inner flex flex-col gap-3">
                    <h3 className="text-yellow-200 font-black text-center text-lg">🎁 現實生活犒賞</h3>
                    <p className="text-center text-gray-400 text-xs">完成日文學習節點，給自己真實生活的犒賞！</p>

                    <button onClick={() => setShowGachaDetails('real')} className="flex items-center justify-center gap-1 text-xs text-yellow-500 hover:text-yellow-400">
                      <Search size={14}/> 查看內容物與自訂項目
                    </button>

                    <button onClick={() => executeGacha('real', 1)} disabled={gachaState.status !== 'idle'} className="w-full bg-yellow-500 text-black font-black p-4 rounded-xl active:scale-95 text-lg shadow-[0_0_20px_rgba(234,179,8,0.4)] flex flex-col items-center gap-1">
                      <span>🎰 抽取自訂實體獎勵</span>
                      <span className="text-xs font-bold bg-black/20 px-4 py-0.5 rounded-full">消耗 500 G</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 天井核心商店 Modal */}
              {showCoreShop && (
                <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md flex flex-col p-5 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-xl text-rose-400 flex items-center gap-2"><Hexagon /> 資料核心黑市 (天井兌換)</h3>
                    <button onClick={() => setShowCoreShop(false)} className="text-gray-400 bg-gray-800 p-2 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="text-xs text-gray-400 mb-4 bg-gray-900 p-3 rounded-lg border border-gray-800">
                    重複裝備轉化為資料核心。這裡可免除隨機性，直接指定兌換神裝湊齊套裝！
                  </div>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3">
                    {VIRTUAL_GACHA_POOL.filter(i => i.rarity === 'SSR' || i.rarity === 'UR').map((item, i) => {
                      const cost = item.rarity === 'UR' ? 15 : 8;
                      const isOwned = (playerData.inventory || []).some(inv => inv?.id === item.id);
                      return (
                        <div key={i} className="bg-gray-900 border border-gray-800 p-3 rounded-xl flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className={`font-bold ${getRarityConfig(item.rarity).color}`}>{item.item}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">{item.buff}</span>
                          </div>
                          <button
                            disabled={isOwned || (playerData.dataCores || 0) < cost}
                            onClick={() => handleExchangeCore(item)}
                            className={`px-3 py-2 rounded-lg font-black text-xs shrink-0 ${isOwned ? 'bg-gray-800 text-gray-500' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
                          >
                            {isOwned ? '已擁有' : `${cost} 核心兌換`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 卡池詳情 Modal */}
              {showGachaDetails && (
                <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-sm flex flex-col p-6 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`font-black text-xl ${showGachaDetails === 'virtual' ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {showGachaDetails === 'virtual' ? '💠 裝備卡池詳情' : '🎁 實體卡池詳情'}
                    </h3>
                    <button onClick={() => setShowGachaDetails(false)} className="text-gray-400 bg-gray-800 p-2 rounded-full hover:text-white"><X size={20}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-6">
                    {[...(showGachaDetails === 'virtual' ? VIRTUAL_GACHA_POOL : (playerData.gachaPool || DEFAULT_GACHA_POOL))].sort((a,b)=>Number(b.chance)-Number(a.chance)).map((p, i) => {
                      const cfg = getRarityConfig(p.rarity);
                      return (
                        <div key={i} className="flex justify-between items-center bg-gray-800/80 p-4 rounded-xl border border-gray-700 shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className={`text-xs px-2 py-1 rounded font-black shrink-0 ${cfg.badge}`}>{p.rarity}</span>
                            <div className="flex flex-col truncate">
                              <span className={`truncate text-base ${cfg.color}`}>{p.item}</span>
                              {p.buff && <span className="text-[10px] text-yellow-300 mt-1">🔥 Buff: {p.buff}</span>}
                            </div>
                          </div>
                          <span className="text-gray-300 font-black text-lg shrink-0 ml-2">{p.chance}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {shopTab === 'settings' && (
                <div className="flex flex-col pb-6">
                  <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 mb-5 text-center">
                    <div className="text-sm text-gray-400 mb-2 font-bold">機率總和限制</div>
                    <div className={`text-3xl font-black ${(!isEditingShop ? true : editPool.reduce((s, i) => s + Number(i.chance||0), 0) === 100) ? 'text-green-400' : 'text-red-400'}`}>
                      {isEditingShop ? editPool.reduce((s, i) => s + Number(i.chance||0), 0) : 100} <span className="text-lg">/ 100 %</span>
                    </div>
                  </div>
                  {!isEditingShop ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3">
                        {(playerData.gachaPool || DEFAULT_GACHA_POOL).map((p, i) => (
                          <div key={i} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center border border-gray-700"><span className="font-bold text-gray-200 truncate text-lg">{p.item}</span><span className="text-cyan-400 font-bold bg-cyan-950 px-3 py-1 rounded-lg text-lg">{p.chance}%</span></div>
                        ))}
                      </div>
                      <button onClick={() => { setEditPool([...(playerData.gachaPool || DEFAULT_GACHA_POOL)]); setIsEditingShop(true); }} className="mt-4 bg-cyan-900/50 border-2 border-cyan-500 text-cyan-200 p-5 rounded-2xl font-black text-lg active:scale-95 transition-transform">
                        {playerData.isGachaLocked ? '🔓 編輯模式 (儲存收 1000G)' : '📝 編輯獎勵 (初次免費)'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3">
                        {editPool.map((p, i) => (
                          <div key={p.id} className="bg-gray-800 p-4 rounded-2xl border border-gray-600 flex flex-col gap-3">
                            <input type="text" value={p.item} onChange={e => { const np = [...editPool]; np[i].item = e.target.value; setEditPool(np); }} placeholder="獎勵名稱" className="bg-gray-900 border-2 border-gray-700 p-4 rounded-xl text-base text-white focus:outline-none focus:border-cyan-500 font-bold" />
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <input type="number" min="1" max="100" value={p.chance} onChange={e => { const np = [...editPool]; np[i].chance = e.target.value; setEditPool(np); }} placeholder="機率" className="bg-gray-900 border-2 border-gray-700 p-4 rounded-xl text-base text-white w-full pr-10 focus:outline-none focus:border-cyan-500 font-bold text-right" />
                                <span className="absolute right-4 top-4 text-gray-500 font-bold">%</span>
                              </div>
                              <button onClick={() => { const np = [...editPool]; np.splice(i, 1); setEditPool(np); }} className="bg-red-900/50 text-red-400 p-4 rounded-xl border-2 border-red-800 active:scale-95 w-16 flex items-center justify-center"><Trash2 size={24}/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setEditPool([...editPool, { id: `g${Date.now()}`, item: '', chance: 0 }])} className="border-2 border-dashed border-gray-600 text-gray-400 p-5 rounded-2xl font-bold active:bg-gray-800"><Plus size={20} className="inline mr-2" /> 新增欄位</button>
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => setIsEditingShop(false)} className="flex-1 bg-gray-800 text-gray-300 p-5 rounded-2xl font-black text-lg active:scale-95">取消</button>
                        <button onClick={() => {
                          if (editPool.length === 0) return showToast("必須至少有一個獎勵選項！", "error");
                          if (editPool.find(p => p.item.trim() === '')) return showToast("獎勵名稱不能為空！", "error");
                          const totalChance = editPool.reduce((sum, item) => sum + Number(item.chance || 0), 0);
                          if (totalChance !== 100) return showToast(`機率總和必須是 100%！(目前：${totalChance}%)`, "error");

                          if (playerData.isGachaLocked) {
                            if ((playerData.gold || 0) < 1000) { setBtnShake(true); setTimeout(() => setBtnShake(false), 500); return showToast("金幣不足！修改需要 1000 G。", "error"); }
                            saveGame({ ...playerData, gachaPool: editPool, gold: playerData.gold - 1000 });
                            setIsEditingShop(false); showToast("修改成功！已扣除 1000 G。", "success");
                          } else {
                            saveGame({ ...playerData, gachaPool: editPool, isGachaLocked: true });
                            setIsEditingShop(false); showToast("設定已儲存並鎖定！", "success");
                          }
                        }} className={`flex-1 text-white p-5 rounded-2xl font-black text-lg active:scale-95 ${btnShake ? 'animate-[shake-error_0.4s_ease-in-out] bg-red-500' : 'bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.5)]'}`}>
                          {playerData.isGachaLocked ? '確認 (-1000G)' : '免費鎖定'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {shopTab === 'history' && (
                <div className="flex flex-col h-full">
                  {(playerData.gachaHistory || []).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3"><Gift size={48} className="opacity-20"/><p className="font-bold">尚無抽獎紀錄</p></div>
                  ) : (
                    <div className="flex flex-col gap-3 pb-4">
                      {(playerData.gachaHistory || []).map((h, i) => {
                        const cfg = getRarityConfig(h.rarity);
                        return (
                          <div key={h.id} className={`p-4 rounded-xl border ${cfg.border} bg-gray-900 flex justify-between items-center`}>
                            <div className="flex flex-col gap-1 overflow-hidden pr-2">
                              <span className="text-xs text-gray-500 font-bold">{h.date}</span><span className={`${cfg.color} font-bold text-lg truncate`}>{h.item}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-black shrink-0 ${cfg.badge}`}>{h.rarity}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-900 shrink-0 bg-gray-950">
               <button onClick={() => setScreen('menu')} className="w-full bg-gray-800 hover:bg-gray-700 p-5 rounded-2xl font-black text-lg active:scale-95 transition-transform">返回終端機</button>
            </div>
          </div>
        )}

        {/* --- 錯誤日誌 --- */}
        {screen === 'records' && (
          <div className="flex-1 p-4 flex flex-col">
            <h2 className="text-orange-400 font-black text-2xl mb-6 flex items-center gap-2"><Database /> 錯誤日誌</h2>
            <div className="overflow-y-auto flex-1 gap-4 flex flex-col pb-4">
              {(playerData.mistakes || []).length === 0 ? <div className="text-gray-500 text-center mt-10 font-bold">完美通關，尚無錯誤紀錄</div> : null}
              {(playerData.mistakes || []).map((m, i) => (
                <div key={i} className="bg-gray-900 p-5 rounded-2xl border border-orange-900/40 shadow-sm">
                  <div className="font-black text-xl mb-3 text-gray-200 leading-loose"><RubyText text={m.q} showRuby={true}/></div>
                  <div className="text-base text-green-400 font-bold bg-green-950/30 px-3 py-2 rounded-lg inline-block border border-green-900/50 leading-loose">✅ <RubyText text={m.a} showRuby={true}/></div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-900 mt-auto shrink-0">
              <button onClick={() => setScreen('menu')} className="w-full bg-gray-800 p-5 rounded-2xl font-black text-lg active:scale-95 transition-transform">返回終端機</button>
            </div>
          </div>
        )}

        {screen === 'league' && (
          <div className="flex-1 flex flex-col py-4 gap-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-yellow-400 font-bold text-xl flex items-center gap-2"><Target /> 駭客聯盟排行榜</h2>
            </div>
            
            <div className="bg-gray-900 border border-yellow-900/50 p-4 rounded-xl text-center">
              <div className="text-sm text-gray-400 mb-1">您目前的階級</div>
              <div className="text-3xl font-black text-yellow-300 drop-shadow-md mb-2">{playerData.league?.tier || '青銅 (Bronze)'}</div>
              <div className="text-xs text-gray-500 bg-gray-950 p-2 rounded">
                結算週期：每週結算一次，前三名晉升，後三名降級。
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-xl border border-gray-800 p-2 flex flex-col gap-2">
              {(() => {
                const players = [...(playerData.league?.bots || []), { name: '您 (You)', points: playerData.league?.points || 0, isPlayer: true }];
                players.sort((a, b) => b.points - a.points);
                
                return players.map((p, idx) => {
                  let rankColor = 'text-gray-500';
                  let bgStyle = p.isPlayer ? 'bg-cyan-900/30 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-gray-800/40 border-gray-700/50';
                  
                  if (idx < 3) rankColor = 'text-green-400';
                  else if (idx >= players.length - 3) rankColor = 'text-red-400';
                  else rankColor = 'text-yellow-500';

                  return (
                    <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border-l-4 ${bgStyle} transition-all`}>
                      <div className="flex items-center gap-3">
                        <span className={`font-black w-8 text-center ${rankColor}`}>#{idx + 1}</span>
                        <span className={`font-bold ${p.isPlayer ? 'text-cyan-300' : 'text-gray-300'}`}>{p.name}</span>
                      </div>
                      <div className={`font-mono font-bold ${p.isPlayer ? 'text-cyan-200' : 'text-yellow-500/80'}`}>{p.points} LP</div>
                    </div>
                  );
                });
              })()}
            </div>
            <button onClick={() => setScreen('menu')} className="mt-auto bg-cyan-900/50 border border-cyan-800 p-3 rounded-lg text-center text-sm text-cyan-200">返回終端機</button>
          </div>
        )}
      </main>

      {showAuthModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-cyan-800 rounded-xl p-6 w-full max-w-sm shadow-[0_0_20px_rgba(6,182,212,0.2)] relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-cyan-400">
              <XCircle size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6 text-cyan-300 text-center flex items-center justify-center gap-2">
              <UserCircle />
              {authMode === 'login' ? '登入系統' : '註冊並綁定進度'}
            </h2>
            
            {authError && <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">{authError}</div>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-cyan-700 text-xs mb-1">EMAIL 憑證</label>
                <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full bg-gray-950 border border-cyan-900 rounded-lg p-2.5 text-cyan-100 focus:outline-none focus:border-cyan-500" placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-cyan-700 text-xs mb-1">授權密碼</label>
                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-gray-950 border border-cyan-900 rounded-lg p-2.5 text-cyan-100 focus:outline-none focus:border-cyan-500" placeholder="至少 6 個字元" />
              </div>
              <button onClick={handleAuthSubmit} className="w-full bg-cyan-800 hover:bg-cyan-700 text-cyan-100 font-bold py-3 rounded-lg transition-colors mt-2">
                {authMode === 'login' ? '執行登入' : '註冊帳號 (繼承當前進度)'}
              </button>
            </div>
            
            <div className="mt-6 text-center text-gray-500 text-sm">
              {authMode === 'login' ? '未註冊？ ' : '已有帳號？ '}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-cyan-400 hover:text-cyan-300 font-bold underline">
                {authMode === 'login' ? '立即註冊' : '切換為登入'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}