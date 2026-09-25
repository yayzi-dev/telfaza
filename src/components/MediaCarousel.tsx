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
    <section className="relative py-4 sm:py-6 space-y-3 group/carousel max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
          className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 bg-black/80 hover:bg-black text-white rounded-full backdrop-blur-md border border-zinc-700/60 opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 cursor-pointer shadow-xl disabled:opacity-0 hidden sm:flex items-center justify-center"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Horizontal Card Row with clean margins and touch scrolling */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth touch-pan-x"
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
          className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 bg-black/80 hover:bg-black text-white rounded-full backdrop-blur-md border border-zinc-700/60 opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 cursor-pointer shadow-xl hidden sm:flex items-center justify-center"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </section>
  );
};
