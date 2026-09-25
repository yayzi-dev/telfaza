import React from 'react';
import { Play, Plus, Check, Star } from 'lucide-react';
import { MediaItem } from '../types';
import { getPosterUrl } from '../services/tmdb';

interface MediaCardProps {
  item: MediaItem;
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  isInWatchlist,
}) => {
  const title = item.title || item.name || 'Untitled';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const isTv = item.media_type === 'tv' || !!item.first_air_date;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '7.8';
  const posterUrl = getPosterUrl(item.poster_path, 'w500');

  return (
    <div className="group relative flex-shrink-0 w-32 sm:w-40 md:w-44 lg:w-48 select-none cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 active:scale-[0.98] hover:z-20 touch-manipulation">
      {/* Poster Container */}
      <div
        onClick={() => onOpenDetails(item)}
        className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-md group-hover:shadow-xl group-hover:shadow-red-950/20 group-hover:border-zinc-600 transition duration-300"
      >
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/75 backdrop-blur-sm text-amber-400 text-[10px] font-bold rounded shadow border border-amber-500/20">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            {rating}
          </span>
          <span className="px-1.5 py-0.5 bg-[#e50914] text-white text-[9px] font-extrabold uppercase rounded shadow tracking-wider">
            HD
          </span>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(item);
              }}
              title="Watch full stream now"
              className="flex-1 py-2 bg-[#e50914] hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-lg transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Stream</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(item);
              }}
              title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
              className="p-2 bg-zinc-800/90 hover:bg-zinc-700 text-white rounded-lg transition"
            >
              {isInWatchlist ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Title & Metadata below poster */}
      <div className="mt-2 px-0.5" onClick={() => onOpenDetails(item)}>
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate group-hover:text-red-400 transition">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
          {year && <span>{year}</span>}
          <span className="text-zinc-600">•</span>
          <span className="uppercase text-[10px] tracking-wider text-zinc-400">
            {isTv ? 'TV Series' : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
};
