import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  watchlistIds: Set<number>;
  categories?: string[];
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  subtitle?: string;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  title,
  items,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  watchlistIds,
  categories,
  activeCategory,
  onSelectCategory,
  subtitle,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-4 sm:py-6 space-y-3 group/carousel">
      {/* Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <span>{title}</span>
            </h2>
          </div>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Category Filter Tabs */}
        {categories && onSelectCategory && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#e50914] text-white shadow-md shadow-red-950/40 font-semibold'
                      : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Carousel Wrapper */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-sm border border-zinc-700/50 opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Horizontal Card Row */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
        >
          {items.map((item) => (
            <MediaCard
              key={`${item.id}-${item.media_type || 'media'}`}
              item={item}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={watchlistIds.has(item.id)}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-sm border border-zinc-700/50 opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 cursor-pointer shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </section>
  );
};
