import React, { useState } from 'react';
import { ShieldCheck, Lock, Play, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { MediaItem } from '../types';

interface LockerModalProps {
  media: MediaItem;
  lockerId: string;
  onUnlocked: () => void;
  onClose?: () => void;
}

export const LockerModal: React.FC<LockerModalProps> = ({
  media,
  lockerId,
  onUnlocked,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const title = media.title || media.name || 'Title';
  const movieSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const lockerUrl = `https://appcomplete.org/cl/i/${lockerId || '4o7vvr'}?aff_sub=${encodeURIComponent(movieSlug)}&aff_sub2=${media.id}`;

  const handleManualUnlock = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        onUnlocked();
      }, 900);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#181818] border border-red-600/40 rounded-2xl shadow-2xl shadow-red-900/30 overflow-hidden text-white">
        {/* Top Glowing Header Bar */}
        <div className="bg-gradient-to-r from-red-700 via-[#e50914] to-red-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/30 rounded-lg text-white">
              <Lock className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                HD Stream Access Verification
                <span className="text-xs bg-black/40 text-amber-300 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Required Once
                </span>
              </h2>
              <p className="text-xs text-red-100/90">
                Unlock 4K Ultra HD & 1080p bandwidth for <span className="font-semibold text-white">"{title}"</span>
              </p>
            </div>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL
          </span>
        </div>

        {/* Security Notification Banner */}
        <div className="px-6 py-3 bg-[#202020] border-b border-[#2d2d2d] flex items-center gap-3 text-xs text-zinc-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            To prevent automated bot scraping and ensure 100% buffer-free speeds, complete 1 quick free step below.
          </span>
        </div>

        {/* Content Body with OGAds Locker Frame */}
        <div className="p-6 space-y-4">
          <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-black/70 border border-zinc-700/60 shadow-inner flex flex-col">
            <iframe
              src={lockerUrl}
              title="OGAds HD Access Verification"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />

            {/* Fallback overlay in case iframe is blocked by client adblocker */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-zinc-400 text-center sm:text-left">
                Offers not loading or blocked by adblock? You can verify directly:
              </span>
              <a
                href={lockerUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                Open in New Tab ↗
              </a>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Permanent unlock saved for this title</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleManualUnlock}
                disabled={isVerifying}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#e50914] hover:bg-red-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Checking Verification...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>I Completed Offer & Unlock HD</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onUnlocked()}
                title="Bypass during testing or development"
                className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 text-xs font-medium rounded-xl transition cursor-pointer"
              >
                Test Pass
              </button>
            </div>
          </div>

          {showSuccessToast && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 justify-center animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verification Successful! Resuming HD playback now...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
