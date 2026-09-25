import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, Key, Terminal, X, CheckCircle2 } from 'lucide-react';
import { adminAuth, AuthState } from '../../services/adminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>(adminAuth.getState());
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const unsub = adminAuth.subscribe((st) => {
      setAuthState(st);
      if (st.lockoutUntil && st.lockoutUntil > Date.now()) {
        setCountdown(Math.ceil((st.lockoutUntil - Date.now()) / 1000));
      } else {
        setCountdown(null);
      }
    });
    return unsub;
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!countdown || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (!prev || prev <= 1) {
          setErrorMsg(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    const result = await adminAuth.login(password.trim());
    setIsLoading(false);

    if (result.success) {
      setPassword('');
      onSuccess();
    } else {
      setErrorMsg(result.error || 'Authentication failed');
      // Shake animation effect
    }
  };

  const isLocked = countdown !== null && countdown > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c0d10] border border-red-900/40 rounded-2xl p-6 shadow-2xl shadow-red-950/30 space-y-6 text-white overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Security Shield Header */}
        <div className="flex items-center gap-3.5 pt-2">
          <div className="p-3 bg-red-950/60 border border-red-600/40 rounded-2xl text-red-500 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-wider uppercase text-white font-mono">
                Security Vault
              </h2>
              <span className="px-2 py-0.5 bg-red-900/40 border border-red-700/50 text-red-400 text-[9px] font-black uppercase rounded tracking-widest">
                SHA-256
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Live Cinema Stream Monitor & Telemetry Control
            </p>
          </div>
        </div>

        {/* Lockout Warning Banner if brute forced */}
        {isLocked && (
          <div className="p-3.5 bg-red-950/80 border border-red-600 rounded-xl space-y-1 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>SECURITY LOCKOUT ACTIVATED</span>
            </div>
            <p className="text-xs text-zinc-300">
              Terminal is temporarily locked due to multiple failed credentials.
            </p>
            <div className="text-sm font-mono font-black text-amber-400 pt-1">
              Cooldown remaining: {countdown}s
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && !isLocked && (
          <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-zinc-400" />
                <span>Master Password / Quick PIN:</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Salted Hash</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                disabled={isLocked || isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter master password..."
                autoFocus
                className="w-full bg-black/70 border border-zinc-800 focus:border-red-600 disabled:opacity-50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 font-mono tracking-wider focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick info note */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Initial Setup Key:</span>
            </div>
            <p>
              Default master password is <code className="text-red-400 font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded">perkvex2026</code>. You can change this to your personal secret password inside the Security Settings tab.
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLocked || isLoading || !password.trim()}
            className="w-full py-3 bg-[#e50914] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Unlock Command Center</span>
              </>
            )}
          </button>
        </form>

        {/* Security Specs Footer */}
        <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Anti-Brute Force (5 attempts)</span>
          <span className="text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            256-Bit Guard Active
          </span>
        </div>
      </div>
    </div>
  );
};
