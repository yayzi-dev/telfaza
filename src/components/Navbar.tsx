import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Flame, Bookmark, History, X, Star, Menu, Play, Home, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { MediaItem } from '../types';
import { searchCatalog, getPosterUrl } from '../services/tmdb';

interface NavbarProps {
  currentTab: 'home' | 'movies' | 'tv' | 'anime' | 'trending' | 'watchlist' | 'history' | 'search';
  onSelectTab: (tab: 'home' | 'movies' | 'tv' | 'anime' | 'trending' | 'watchlist' | 'history' | 'search') => void;
  onOpenMedia: (item: MediaItem) => void;
  onSearchSubmit?: (query: string) => void;
  onOpenSettings?: () => void;
  watchlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenMedia,
  onSearchSubmit,
  watchlistCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-focus mobile input when mobile search is opened
  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Search debounce for quick live hints
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setShowSearchDropdown(false);
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
    }, 250);

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

  // Submit search on Enter key or Search button click
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setShowSearchDropdown(false);
    setMobileSearchOpen(false);

    if (onSearchSubmit) {
      onSearchSubmit(query);
    } else {
      onSelectTab('search');
    }
  };

  interface NavLinkItem {
    id: 'home' | 'movies' | 'tv' | 'anime' | 'trending' | 'watchlist' | 'history';
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    count?: number;
    badge?: string;
  }

  const navLinks: NavLinkItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Series', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Sparkles, badge: 'HOT' },
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            type="button"
            onClick={() => {
              onSelectTab('home');
              setMobileMenuOpen(false);
              setMobileSearchOpen(false);
            }}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer group shrink-0"
          >
            <span className="text-2xl sm:text-3xl font-black font-bebas tracking-wider text-[#e50914] group-hover:scale-105 transition">
              PERK<span className="text-white">VEX</span>
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
                  {link.badge && (
                    <span className="px-1.5 py-0.2 bg-gradient-to-r from-red-600 to-pink-600 text-[8px] text-white rounded-full font-black uppercase tracking-wider">
                      {link.badge}
                    </span>
                  )}
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

        {/* Right: Search Box (Desktop) + Mobile Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Search Box with Live Dropdown */}
          <div ref={searchRef} className="relative hidden md:block w-56 lg:w-72">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute left-2.5 text-zinc-400 hover:text-white transition p-0.5 cursor-pointer"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
              <input
                ref={desktopInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0 || searchQuery.trim()) setShowSearchDropdown(true);
                }}
                placeholder="Search all movies & series (Enter)..."
                className="w-full pl-9 pr-8 py-1.5 bg-black/70 border border-zinc-700/80 focus:border-[#e50914] focus:bg-black rounded-full text-xs text-zinc-100 placeholder-zinc-500 outline-none transition duration-200"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-2.5 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Dropdown Results (Desktop) */}
            {showSearchDropdown && searchQuery.trim() && (
              <div className="absolute top-full mt-2 right-0 w-80 sm:w-96 max-h-[480px] overflow-y-auto bg-[#181818] border border-zinc-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in divide-y divide-zinc-800">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Search for "{searchQuery}"</span>
                  <span className="text-zinc-400">
                    {isSearching ? 'Searching...' : `${searchResults.length} found`}
                  </span>
                </div>
                <div className="pt-1">
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-4 text-center text-xs text-zinc-400">
                      Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded font-mono">Enter</kbd> to search the entire global catalog.
                    </div>
                  ) : (
                    searchResults.map((item) => {
                      const title = item.title || item.name || 'Untitled';
                      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                      const isTv = item.media_type === 'tv' || !!item.first_air_date;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setShowSearchDropdown(false);
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
                    })
                  )}
                </div>

                {/* View All Search Results button */}
                <div className="pt-2 pb-1 px-1">
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full py-2 px-3 bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow cursor-pointer"
                  >
                    <span>View all results for "{searchQuery}"</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Dedicated Search Icon Button */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              setMobileMenuOpen(false);
            }}
            aria-label="Toggle mobile search"
            className={`md:hidden p-2 rounded-lg transition cursor-pointer ${
              mobileSearchOpen || currentTab === 'search' ? 'bg-[#e50914] text-white' : 'text-zinc-300 hover:text-white bg-zinc-900/80 border border-zinc-800'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setMobileSearchOpen(false);
            }}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-zinc-300 hover:text-white bg-zinc-900/80 border border-zinc-800 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Full-Width Mobile Search Bar & Live Dropdown Overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-[#181818] border-b border-zinc-800 px-3 py-3 space-y-3 animate-fade-in shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                placeholder="Search all movies, series, anime (Enter)..."
                className="w-full pl-9 pr-9 py-2 bg-black/90 border border-zinc-700 focus:border-[#e50914] rounded-xl text-xs text-white placeholder-zinc-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#e50914] text-white text-xs font-bold rounded-xl active:scale-95 transition cursor-pointer"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </form>

          {/* Mobile Search Results */}
          {searchQuery.trim() && (
            <div className="max-h-[65vh] overflow-y-auto divide-y divide-zinc-850 pt-1 space-y-1">
              <div className="pb-1.5 text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                <span>Quick Results for "{searchQuery}"</span>
                <span>{isSearching ? 'Searching...' : `${searchResults.length} found`}</span>
              </div>
              
              {searchResults.map((item) => {
                const title = item.title || item.name || 'Untitled';
                const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                const isTv = item.media_type === 'tv' || !!item.first_air_date;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMobileSearchOpen(false);
                      onOpenMedia(item);
                    }}
                    className="w-full flex items-center gap-3 py-2 px-2 hover:bg-zinc-800/80 rounded-xl transition text-left cursor-pointer"
                  >
                    <img
                      src={getPosterUrl(item.poster_path, 'w342')}
                      alt={title}
                      className="w-10 h-14 object-cover rounded-md shrink-0 bg-zinc-900 border border-zinc-800"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        {year && <span>{year}</span>}
                        <span className="px-1.5 py-0.2 bg-zinc-800 text-[10px] text-zinc-300 rounded uppercase font-medium">
                          {isTv ? 'TV' : 'Movie'}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {item.vote_average?.toFixed(1) || '7.5'}
                        </span>
                      </div>
                    </div>
                    <div className="p-1.5 bg-[#e50914] text-white rounded-lg shrink-0">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </button>
                );
              })}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full py-2.5 bg-[#e50914] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <span>See all full search results for "{searchQuery}"</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#181818] border-b border-zinc-800 px-4 py-3 space-y-2 animate-fade-in shadow-2xl">
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
