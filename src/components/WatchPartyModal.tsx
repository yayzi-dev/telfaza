import React, { useState } from 'react';
import { X, Copy, Check, Share2, Users, Send, ExternalLink, Sparkles, MessageSquare } from 'lucide-react';
import { MediaItem } from '../types';

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem;
  season?: number;
  episode?: number;
}

export const WatchPartyModal: React.FC<WatchPartyModalProps> = ({
  isOpen,
  onClose,
  media,
  season = 1,
  episode = 1,
}) => {
  const [copied, setCopied] = useState(false);
  const title = media.title || media.name || 'Featured Title';
  const isTv = media.media_type === 'tv' || !!media.first_air_date;

  if (!isOpen) return null;

  // Generate deep-linking watch URL
  const baseUrl = window.location.origin;
  const shareUrl = isTv
    ? `${baseUrl}/?watch=${media.id}&season=${season}&episode=${episode}`
    : `${baseUrl}/?watch=${media.id}`;

  const shareText = isTv
    ? `🍿 Join my Watch Party for "${title}" (Season ${season}, Episode ${episode}) in Ultra HD on Perkvex!`
    : `🍿 Join my Watch Party for "${title}" in Ultra HD on Perkvex!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#18181b] border border-zinc-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/20 text-red-500 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Watch Party & Cinema Share</span>
                <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase rounded tracking-wider">
                  LIVE SYNC
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Invite friends to stream <span className="text-zinc-200 font-semibold">{title}</span> together
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room Info Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Current Stream:</span>
            <span className="text-white font-bold truncate max-w-[240px]">
              {title} {isTv ? `• S${season}:E${episode}` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Playback Quality:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              1080p Ultra HD / Zero Lag
            </span>
          </div>
        </div>

        {/* Share Link Copy Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 block">
            Direct Cinema Room Link:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-black/70 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono truncate focus:outline-none focus:border-red-600"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#e50914] hover:bg-red-700 text-white shadow-lg shadow-red-950/40'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-400 animate-in fade-in">
              ✓ Room link copied! Send it to your friends to start watching together.
            </p>
          )}
        </div>

        {/* 1-Click Social Sharing */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Share Directly:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="py-2.5 px-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleTelegram}
              className="py-2.5 px-3 bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/40 text-[#229ED9] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            <button
              type="button"
              onClick={handleTwitter}
              className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Twitter / X</span>
            </button>
          </div>
        </div>

        {/* Sync Tips Banner */}
        <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-[11px] text-zinc-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Pro Tip:</strong> When your friend opens the link, countdown together (3, 2, 1, Play!) to stream synchronized in crystal clear 1080p HD.
          </p>
        </div>
      </div>
    </div>
  );
};
