import React from 'react';
import { Play, Info, Plus, Check, Star, Film, Tv, Volume2 } from 'lucide-react';
import { MediaItem } from '../types';
import { getBackdropUrl } from '../services/tmdb';

interface HeroBannerProps {
  media: MediaItem | null;
  onWatchNow: (item: MediaItem) => void;
  onOpenInfo: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: boolean;
  onNextHero?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  media,
  onWatchNow,
  onOpenInfo,
  onToggleWatchlist,
  isInWatchlist,
}) => {
  if (!media) return null;

  const title = media.title || media.name || 'Featured Title';
  const year = (media.release_date || media.first_air_date || '').slice(0, 4);
  const isTv = media.media_type === 'tv' || !!media.first_air_date;
  const rating = media.vote_average ? media.vote_average.toFixed(1) : '8.5';
  const backdropUrl = getBackdropUrl(media.backdrop_path, 'original');

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden select-none bg-[#141414]">
      {/* Background Backdrop Image */}
      <img
        src={backdropUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        loading="eager"
      />

      {/* Cinematic Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#141414]" />

      {/* Content Overlay */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-14 sm:pb-18 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#e50914] text-white rounded-md tracking-wider uppercase font-bold text-[10px] shadow">
              Featured Ultra HD
            </span>
            <span className="flex items-center gap-1 text-amber-400 bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{rating} TMDB</span>
            </span>
            {year && (
              <span className="text-zinc-300 bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-white/10">
                {year}
              </span>
            )}
            <span className="flex items-center gap-1 text-zinc-300 bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-white/10">
              {isTv ? <Tv className="w-3.5 h-3.5 text-red-400" /> : <Film className="w-3.5 h-3.5 text-red-400" />}
              <span>{isTv ? 'TV Series' : 'Movie'}</span>
            </span>
            <span className="px-2 py-0.5 border border-zinc-500 text-zinc-300 rounded text-[10px] uppercase font-bold">
              4K Ultra HD
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg line-clamp-2">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-zinc-300 text-xs sm:text-sm lg:text-base line-clamp-3 leading-relaxed drop-shadow max-w-xl">
            {media.overview || 'Stream full-length movie in crystal-clear Ultra HD across multiple high-speed servers with zero buffering.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onWatchNow(media)}
              className="px-6 sm:px-8 py-3 bg-[#e50914] hover:bg-red-700 active:scale-95 text-white font-bold text-sm sm:text-base rounded-xl transition duration-200 flex items-center gap-2.5 shadow-xl shadow-red-950/60 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Watch Now</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenInfo(media)}
              className="px-5 py-3 bg-zinc-800/80 hover:bg-zinc-700/90 active:scale-95 text-white font-semibold text-sm rounded-xl backdrop-blur-sm border border-zinc-600/50 transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Info className="w-4 h-4 text-zinc-300" />
              <span>Trailer & Info</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleWatchlist(media)}
              title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
              className="p-3 bg-zinc-800/80 hover:bg-zinc-700/90 active:scale-95 text-white rounded-xl backdrop-blur-sm border border-zinc-600/50 transition duration-200 cursor-pointer"
            >
              {isInWatchlist ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
