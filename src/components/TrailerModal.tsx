import React, { useEffect, useState } from 'react';
import { X, Youtube, ExternalLink, Loader2 } from 'lucide-react';
import { MediaItem, VideoItem } from '../types';
import { fetchVideos } from '../services/tmdb';

interface TrailerModalProps {
  media: MediaItem;
  onClose: () => void;
  onWatchNow: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ media, onClose, onWatchNow }) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchVideos(mediaType, media.id).then((vids) => {
      if (!isMounted) return;
      setVideos(vids);
      // Prefer Official Trailer or Teaser
      const trailer = vids.find(
        (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      ) || vids.find((v) => v.site === 'YouTube');
      if (trailer) {
        setSelectedKey(trailer.key);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [media.id, mediaType]);

  const title = media.title || media.name || 'Trailer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#181818] border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#202020] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Youtube className="w-5 h-5 text-red-500 shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">{title} - Official Trailer</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onWatchNow}
              className="px-3.5 py-1.5 bg-[#e50914] hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              Watch Full Movie
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <span className="text-xs">Loading official trailer...</span>
            </div>
          ) : selectedKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-zinc-400">
              <Youtube className="w-12 h-12 text-zinc-600" />
              <p className="text-sm">Official YouTube trailer not available for this title.</p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs flex items-center gap-2 transition"
              >
                Search on YouTube <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Alternative trailer selector if multiple exist */}
        {videos.length > 1 && (
          <div className="p-3 bg-[#151515] border-t border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-zinc-400 shrink-0 font-medium">Clips & Trailers:</span>
            {videos.slice(0, 6).map((vid) => (
              <button
                key={vid.id}
                onClick={() => setSelectedKey(vid.key)}
                className={`px-2.5 py-1 rounded-md shrink-0 transition text-xs truncate max-w-[180px] ${
                  selectedKey === vid.key
                    ? 'bg-red-600 text-white font-medium'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {vid.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
