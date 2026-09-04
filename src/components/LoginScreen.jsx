import React, { useState, useEffect } from 'react';
import { Fingerprint, LogIn, Hexagon } from 'lucide-react';
import { sfx } from '../utils/soundFX';

export const LoginScreen = ({ onLogin }) => {
  const [callsign, setCallsign] = useState('');
  const [bootText, setBootText] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fullBootSequence = "INITIATING SYSTEM...\nCONNECTING TO MAINFRAME...\nBYPASSING SECURITY...\nACCESS GRANTED.";

  useEffect(() => {
    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength++;
      setBootText(fullBootSequence.substring(0, currentLength));
      if (currentLength >= fullBootSequence.length) {
        clearInterval(interval);
        setTimeout(() => setIsBooting(false), 500);
      }
    }, 20); // typing speed

    // Play a subtle sound on mount
    sfx.init();

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!callsign.trim()) return;

    setIsLoggingIn(true);
    sfx.playCharge(1.5); // 1.5 seconds charge sound

    // Add screen shake effect and transition to menu
    setTimeout(() => {
      onLogin(callsign.trim());
    }, 1500);
  };

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-1000 ${isLoggingIn ? 'animate-[camera-shake_0.3s_infinite] scale-105 opacity-0' : 'opacity-100'}`}>

      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-cyan-500 font-mono text-xs animate-pulse opacity-50">sys.status: STANDBY</div>
        <div className="absolute bottom-10 right-10 text-cyan-500 font-mono text-xs opacity-50">protocol: N4_HACKER</div>
        {/* Some diagonal arknights-style geometric shapes */}
        <div className="absolute top-1/4 right-0 w-64 h-32 bg-cyan-900/10 -skew-x-12 transform translate-x-10" />
        <div className="absolute bottom-1/4 left-0 w-48 h-16 bg-yellow-900/10 skew-x-12 transform -translate-x-10" />
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col gap-8">

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
           {isBooting && <span className="animate-ping inline-block w-2 h-4 bg-cyan-400 ml-1 translate-y-1" />}
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className={`flex flex-col gap-4 transition-all duration-700 transform ${isBooting ? 'translate-y-10 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
          <div className="relative">
            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600" size={20} />
            <input
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              placeholder="輸入幹員代號 (Callsign)..."
              className="w-full bg-gray-950/80 border-2 border-cyan-900 focus:border-cyan-400 text-cyan-100 pl-10 pr-4 py-4 font-mono font-bold text-sm tracking-widest focus:outline-none focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all uppercase placeholder:text-gray-700 skew-x-[-2deg]"
              autoFocus
              maxLength={12}
            />
          </div>

          <button
            type="submit"
            disabled={!callsign.trim() || isLoggingIn}
            className={`relative group overflow-hidden w-full py-4 bg-cyan-950 border border-cyan-700 text-cyan-300 font-black tracking-widest transition-all hover:bg-cyan-900 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] skew-x-[-2deg] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <LogIn size={18} />
            {isLoggingIn ? 'OVERRIDING SYSTEM...' : 'SYSTEM OVERRIDE'}
          </button>
        </form>

      </div>
    </div>
  );
};
