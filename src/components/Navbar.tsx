import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Flame, Bookmark, History, X, Star, Menu, Play, Home } from 'lucide-react';
import { MediaItem } from '../types';
import { searchCatalog, getPosterUrl } from '../services/tmdb';

interface NavbarProps {
  currentTab: 'home' | 'movies' | 'tv' | 'trending' | 'watchlist' | 'history';
  onSelectTab: (tab: 'home' | 'movies' | 'tv' | 'trending' | 'watchlist' | 'history') => void;
  onOpenMedia: (item: MediaItem) => void;
  onOpenSettings?: () => void;
  watchlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenMedia,
  watchlistCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Scroll listener for translucent Netflix-style blur navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCatalog(searchQuery);
        setSearchResults(results.slice(0, 8));
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  interface NavLinkItem {
    id: 'home' | 'movies' | 'tv' | 'trending' | 'watchlist' | 'history';
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    count?: number;
  }

  const navLinks: NavLinkItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Series', icon: Tv },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'watchlist', label: 'My List', count: watchlistCount, icon: Bookmark },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg border-b border-white/5 py-2.5'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer group"
          >
            <span className="text-2xl sm:text-3xl font-black font-bebas tracking-wider text-[#e50914] group-hover:scale-105 transition">
              FLIX<span className="text-white">STREAM</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-black uppercase bg-[#e50914] text-white rounded font-sans tracking-widest shadow-sm">
              HD
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-full transition relative flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'text-white bg-white/10 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="px-1.5 py-0.2 bg-[#e50914] text-[10px] text-white rounded-full font-bold">
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search + ZIP + Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Box with Live Dropdown */}
          <div ref={searchRef} className="relative w-44 sm:w-64 lg:w-72">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search movies, TV shows..."
                className="w-full pl-9 pr-8 py-1.5 bg-black/60 border border-zinc-700/80 focus:border-[#e50914] focus:bg-black/90 rounded-full text-xs text-zinc-100 placeholder-zinc-500 outline-none transition duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 left-0 w-80 sm:w-96 max-h-[460px] overflow-y-auto bg-[#181818] border border-zinc-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in divide-y divide-zinc-800">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Results for "{searchQuery}"</span>
                  <span className="text-zinc-400">{searchResults.length} found</span>
                </div>
                <div className="pt-1">
                  {searchResults.map((item) => {
                    const title = item.title || item.name || 'Untitled';
                    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                    const isTv = item.media_type === 'tv' || !!item.first_air_date;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          onOpenMedia(item);
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/80 transition text-left cursor-pointer group"
                      >
                        <img
                          src={getPosterUrl(item.poster_path, 'w342')}
                          alt={title}
                          className="w-10 h-14 object-cover rounded-md shrink-0 bg-zinc-900 border border-zinc-800 shadow group-hover:scale-105 transition"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition">
                            {title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                            {year && <span>{year}</span>}
                            <span className="px-1.5 py-0.2 bg-zinc-800 text-[10px] text-zinc-300 rounded uppercase font-medium">
                              {isTv ? 'TV Show' : 'Movie'}
                            </span>
                            <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {item.vote_average?.toFixed(1) || '7.5'}
                            </span>
                          </div>
                        </div>
                        <div className="p-1.5 bg-[#e50914]/20 group-hover:bg-[#e50914] text-red-400 group-hover:text-white rounded-lg transition shrink-0">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#181818] border-b border-zinc-800 px-4 py-3 space-y-2 animate-fade-in">
          {navLinks.map((link) => {
            const active = currentTab === link.id;
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onSelectTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition ${
                  active ? 'bg-[#e50914] text-white' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </div>
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-2 py-0.5 bg-white text-[#e50914] text-[10px] font-bold rounded-full">
                    {link.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
