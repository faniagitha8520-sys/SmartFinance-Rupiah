import { useState } from "react";
import { hashPin } from "../utils";

export default function PinScreen({ onUnlock, settings, setSettings }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const hashed = hashPin(pin);
    if (hashed === settings.pin) {
      try { sessionStorage.setItem("lz_unlocked", "1"); } catch(e) {}
      onUnlock();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0612] font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-600/[0.06] rounded-full blur-[120px]" />
      </div>
      <div className="relative w-full max-w-xs">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center shadow-xl shadow-pink-900/40 animate-float">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-lg font-bold gradient-text-pink mb-1">Smart Finance</h1>
          <p className="text-xs text-slate-500 mb-6">Masukkan PIN untuk melanjutkan</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              maxLength={6}
              autoFocus
              placeholder="••••••"
              className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-center text-lg font-mono tracking-[8px] text-white placeholder-slate-700 outline-none transition-all ${error ? 'border-red-500/50 animate-[shake_0.3s_ease-in-out]' : 'border-white/[0.08] focus:border-pink-500/40'}`}
            />
            {error && <p className="text-xs text-red-400 mt-2 animate-fade-in-up">PIN salah, coba lagi</p>}
            <button type="submit"
              className="w-full mt-4 py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-900/30 transition-all active:scale-95">
              Unlock
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
