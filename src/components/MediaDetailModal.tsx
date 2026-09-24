import React, { useEffect, useState } from 'react';
import { X, Play, Plus, Check, Star, Calendar, Clock, Film, Tv, Youtube, Layers } from 'lucide-react';
import { MediaItem } from '../types';
import { fetchDetails, getBackdropUrl, getPosterUrl } from '../services/tmdb';

interface MediaDetailModalProps {
  media: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem) => void;
  onOpenTrailer: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: boolean;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  media,
  onClose,
  onPlay,
  onOpenTrailer,
  onToggleWatchlist,
  isInWatchlist,
}) => {
  const [detailed, setDetailed] = useState<MediaItem>(media);
  const isTv = media.media_type === 'tv' || !!media.first_air_date;

  useEffect(() => {
    fetchDetails(isTv ? 'tv' : 'movie', media.id).then((res) => {
      if (res) setDetailed(res);
    });
  }, [media.id, isTv]);

  const title = detailed.title || detailed.name || 'Untitled';
  const year = (detailed.release_date || detailed.first_air_date || '').slice(0, 4);
  const rating = detailed.vote_average ? detailed.vote_average.toFixed(1) : '8.1';
  const backdropUrl = getBackdropUrl(detailed.backdrop_path, 'w1280');
  const posterUrl = getPosterUrl(detailed.poster_path, 'w500');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#181818] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-white my-auto">
        {/* Backdrop Banner Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/60 to-black/40" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black text-zinc-300 hover:text-white rounded-full backdrop-blur-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Quick Actions over backdrop */}
          <div className="absolute inset-x-6 bottom-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2 py-0.5 bg-[#e50914] text-white rounded uppercase text-[10px] font-bold">
                {isTv ? 'TV Series' : 'Movie'}
              </span>
              <span className="flex items-center gap-1 text-amber-400 bg-black/70 px-2 py-0.5 rounded border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {rating}
              </span>
              {year && (
                <span className="text-zinc-300 bg-black/70 px-2 py-0.5 rounded">
                  {year}
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 border border-zinc-400/60 rounded uppercase font-bold text-zinc-300">
                Ultra HD
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">
              {title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onPlay(detailed)}
                className="px-6 py-2.5 bg-[#e50914] hover:bg-red-700 active:scale-95 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Stream Now</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenTrailer(detailed)}
                className="px-4 py-2.5 bg-zinc-800/90 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl border border-zinc-600/40 transition flex items-center gap-2 cursor-pointer"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Trailer</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWatchlist(detailed)}
                className="p-2.5 bg-zinc-800/90 hover:bg-zinc-700 text-white rounded-xl border border-zinc-600/40 transition cursor-pointer"
                title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
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

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {detailed.tagline && (
            <p className="text-xs text-red-400 font-medium italic">
              "{detailed.tagline}"
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="space-y-4 flex-1">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {detailed.overview || 'No synopsis provided for this title.'}
              </p>

              {/* Genre Pills */}
              {detailed.genres && detailed.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {detailed.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-2.5 py-1 bg-zinc-800/80 border border-zinc-700/60 rounded-lg text-xs text-zinc-300 font-medium"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Meta Info Side Column */}
            <div className="w-full sm:w-56 shrink-0 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Audio & Quality:</span>
                <span className="text-white font-medium">Dolby Atmos / 4K Ultra HD</span>
              </div>
              {detailed.runtime ? (
                <div>
                  <span className="text-zinc-400 block text-[11px]">Runtime:</span>
                  <span className="text-white font-medium">
                    {Math.floor(detailed.runtime / 60)}h {detailed.runtime % 60}m
                  </span>
                </div>
              ) : null}
              {detailed.number_of_seasons ? (
                <div>
                  <span className="text-zinc-400 block text-[11px]">Seasons:</span>
                  <span className="text-white font-medium">
                    {detailed.number_of_seasons} Seasons ({detailed.number_of_episodes || 0} Episodes)
                  </span>
                </div>
              ) : null}
              <div>
                <span className="text-zinc-400 block text-[11px]">Mirrors:</span>
                <span className="text-emerald-400 font-semibold">6 Live Servers Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
