import { useState, useEffect, useRef } from 'react';
import { Mail, Smartphone, LogIn, Hexagon, AlertCircle } from 'lucide-react';
import { sfx } from '../utils/soundFX';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CLEAN_REGEX = /[\s\-().]/g;
const PHONE_VALID_REGEX = /^\+?\d{8,15}$/;

export const LoginScreen = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState(() => {
    try {
      const raw = localStorage.getItem('neon_game_last_account');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.mode === 'phone' || parsed?.mode === 'email') return parsed.mode;
      }
    } catch { /* ignore storage errors */ }
    return 'email';
  });

  const [emailInput, setEmailInput] = useState(() => {
    try {
      const raw = localStorage.getItem('neon_game_last_account');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.mode === 'email' && parsed?.value) return parsed.value;
      }
    } catch { /* ignore storage errors */ }
    return '';
  });

  const [phoneInput, setPhoneInput] = useState(() => {
    try {
      const raw = localStorage.getItem('neon_game_last_account');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.mode === 'phone' && parsed?.value) return parsed.value;
      }
    } catch { /* ignore storage errors */ }
    return '';
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [bootText, setBootText] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const loginTimerRef = useRef(null);

  const fullBootSequence = "INITIATING SYSTEM...\nCONNECTING TO MAINFRAME...\nVERIFYING AUTH CHANNEL...\nREADY FOR CREDENTIALS.";
  const bootIntervalRef = useRef(null);
  const bootDoneTimerRef = useRef(null);

  const skipBoot = () => {
    if (!isBooting) return;
    if (bootIntervalRef.current) clearInterval(bootIntervalRef.current);
    if (bootDoneTimerRef.current) clearTimeout(bootDoneTimerRef.current);
    setBootText(fullBootSequence);
    setIsBooting(false);
  };

  useEffect(() => {
    let currentLength = 0;
    bootIntervalRef.current = setInterval(() => {
      currentLength += 2;
      setBootText(fullBootSequence.substring(0, currentLength));
      if (currentLength >= fullBootSequence.length) {
        clearInterval(bootIntervalRef.current);
        bootIntervalRef.current = null;
        bootDoneTimerRef.current = setTimeout(() => setIsBooting(false), 180);
      }
    }, 14);

    sfx.init();

    return () => {
      if (bootIntervalRef.current) clearInterval(bootIntervalRef.current);
      if (bootDoneTimerRef.current) clearTimeout(bootDoneTimerRef.current);
      if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
    };
  }, []);

  const currentValue = loginMode === 'email' ? emailInput : phoneInput;

  const handleModeSwitch = (mode) => {
    if (isLoggingIn) return;
    setLoginMode(mode);
    setErrorMsg('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLoggingIn || isBooting) return;

    const normalizedValue = loginMode === 'email'
      ? emailInput.trim().toLowerCase()
      : phoneInput.trim().replace(PHONE_CLEAN_REGEX, '');

    if (loginMode === 'email') {
      if (!EMAIL_REGEX.test(normalizedValue)) {
        setErrorMsg('請輸入有效的電子信箱格式（例：player@example.com）');
        return;
      }
    } else if (!PHONE_VALID_REGEX.test(normalizedValue)) {
      setErrorMsg('請輸入有效的手機號碼（8～15 碼數字，例：0912345678）');
      return;
    }

    setErrorMsg('');
    const account = {
      mode: loginMode,
      value: normalizedValue,
      key: `${loginMode}_${normalizedValue}`
    };

    try {
      localStorage.setItem('neon_game_last_account', JSON.stringify({ mode: loginMode, value: normalizedValue }));
    } catch { /* ignore storage errors */ }

    setIsLoggingIn(true);
    sfx.playCharge(0.6);

    loginTimerRef.current = setTimeout(() => {
      loginTimerRef.current = null;
      onLogin(account);
    }, 550);
  };

  return (
    <div
      onClick={isBooting ? skipBoot : undefined}
      className={`flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500 ${isLoggingIn ? 'animate-[camera-shake_0.3s_infinite] scale-105 opacity-0' : 'opacity-100'}`}
    >

      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-cyan-500 font-mono text-xs animate-pulse opacity-50">sys.status: STANDBY</div>
        <div className="absolute bottom-10 right-10 text-cyan-500 font-mono text-xs opacity-50">protocol: N4_HACKER</div>
        <div className="absolute top-1/4 right-0 w-64 h-32 bg-cyan-900/10 -skew-x-12 transform translate-x-10" />
        <div className="absolute bottom-1/4 left-0 w-48 h-16 bg-yellow-900/10 skew-x-12 transform -translate-x-10" />
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col gap-7">

        {/* Title area */}
        <div className="flex flex-col items-center gap-2">
           <Hexagon size={64} className="text-cyan-400 mb-2 animate-[ring-spin-right_10s_linear_infinite]" strokeWidth={1} />
           <h1 className="text-4xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">語譯駭客</h1>
           <h2 className="text-xs text-cyan-500 tracking-[0.5em] font-bold">N4 CYBER PROTOCOL</h2>
        </div>

        {/* Terminal Boot Sequence Area */}
        <div className="bg-gray-900/80 p-4 rounded-lg border border-cyan-900/50 min-h-[100px] text-xs font-mono text-cyan-400 whitespace-pre-wrap flex flex-col justify-end shadow-inner relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse" />
           {bootText}
           {isBooting && (
             <div className="flex items-center justify-between mt-1">
               <span className="animate-ping inline-block w-2 h-4 bg-cyan-400" />
               <span className="text-[10px] text-cyan-500/80 font-sans font-bold">點擊任意處略過</span>
             </div>
           )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className={`flex flex-col gap-3.5 transition-all duration-500 transform ${isBooting ? 'translate-y-6 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>

          {/* Login Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-gray-900/80 p-1 rounded-xl border border-cyan-900/60">
            <button
              type="button"
              onClick={() => handleModeSwitch('email')}
              className={`py-2.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                loginMode === 'email'
                  ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Mail size={14} /> 電子信箱登入
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('phone')}
              className={`py-2.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                loginMode === 'phone'
                  ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Smartphone size={14} /> 手機號碼登入
            </button>
          </div>

          <div className="relative">
            {loginMode === 'email' ? (
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-600" size={18} />
            ) : (
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-600" size={18} />
            )}
            <input
              type={loginMode === 'email' ? 'email' : 'tel'}
              inputMode={loginMode === 'email' ? 'email' : 'tel'}
              autoComplete={loginMode === 'email' ? 'email' : 'tel'}
              value={currentValue}
              onChange={(e) => {
                setErrorMsg('');
                if (loginMode === 'email') setEmailInput(e.target.value);
                else setPhoneInput(e.target.value);
              }}
              placeholder={loginMode === 'email' ? '輸入電子信箱 (name@example.com)...' : '輸入手機號碼 (例：0912345678)...'}
              className="w-full bg-gray-950/80 border-2 border-cyan-900 focus:border-cyan-400 text-cyan-100 pl-10 pr-4 py-4 font-mono font-bold text-sm tracking-wide focus:outline-none focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all placeholder:text-gray-600 skew-x-[-2deg]"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="text-xs font-bold text-rose-300 bg-rose-950/70 border border-rose-700/60 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!currentValue.trim() || isLoggingIn}
            className="relative group overflow-hidden w-full py-4 bg-cyan-950 border border-cyan-700 text-cyan-300 font-black tracking-widest transition-all hover:bg-cyan-900 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] skew-x-[-2deg] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <LogIn size={18} />
            {isLoggingIn ? 'SYNCING ACCOUNT...' : '登入並同步紀錄'}
          </button>

          <p className="text-[11px] text-center text-gray-500">
            以{loginMode === 'email' ? '電子信箱' : '手機號碼'}作為雲端存檔識別帳號
          </p>
        </form>

      </div>
    </div>
  );
};

