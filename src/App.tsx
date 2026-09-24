import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Tv,
  Flame,
  Bookmark,
  History,
  Play,
  Trash2,
  Sparkles,
  Info,
  Layers,
  Star,
} from 'lucide-react';
import { MediaItem, WatchHistoryItem, AppSettings } from './types';
import {
  DEFAULT_TMDB_API_KEY,
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  fetchByGenre,
  fetchAnime,
  GENRE_MAP,
  getPosterUrl,
} from './services/tmdb';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MediaCarousel } from './components/MediaCarousel';
import { CinemaPlayer } from './components/CinemaPlayer';
import { MediaDetailModal } from './components/MediaDetailModal';
import { TrailerModal } from './components/TrailerModal';
import { SettingsModal } from './components/SettingsModal';
import { triggerNativeOGAdsLocker } from './utils/locker';

const CATEGORIES = ['All', 'Action', 'Comedy', 'Horror', 'Sci-Fi', 'Drama'];

export default function App() {
  // Navigation & Active View
  const [currentTab, setCurrentTab] = useState<'home' | 'movies' | 'tv' | 'anime' | 'trending' | 'watchlist' | 'history'>('home');
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [playerSeason, setPlayerSeason] = useState(1);
  const [playerEpisode, setPlayerEpisode] = useState(1);

  // Modals
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);
  const [trailerMedia, setTrailerMedia] = useState<MediaItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Data Collections
  const [heroMedia, setHeroMedia] = useState<MediaItem | null>(null);
  const [trendingAll, setTrendingAll] = useState<MediaItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<MediaItem[]>([]);
  const [genreFilteredItems, setGenreFilteredItems] = useState<MediaItem[]>([]);

  // Anime Collection
  const [animeCarouselItems, setAnimeCarouselItems] = useState<MediaItem[]>([]);
  const [animeCatalogItems, setAnimeCatalogItems] = useState<MediaItem[]>([]);
  const [animeFilter, setAnimeFilter] = useState<'all' | 'series' | 'movies'>('all');
  const [loadingAnime, setLoadingAnime] = useState(false);

  // Filtering
  const [activeCategory, setActiveCategory] = useState('All');
  const [catalogType, setCatalogType] = useState<'movie' | 'tv'>('movie');

  // Watchlist & History
  const [watchlist, setWatchlist] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('flixstream_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('flixstream_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('flixstream_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lockerId === 'o4e2pq') parsed.lockerId = 'o4e5p2';
        return parsed;
      }
    } catch {
      // ignore
    }
    return {
      tmdbApiKey: DEFAULT_TMDB_API_KEY,
      lockerEnabled: true,
      lockerId: 'o4e5p2',
      lockerDelaySeconds: 20,
    };
  });

  // Dynamic Tab SEO Optimization (Titles & Descriptions for high Google Rankings)
  useEffect(() => {
    if (activeMedia) return; // CinemaPlayer handles its own media SEO

    const SEO_TAB_CONFIG: Record<string, { title: string; desc: string }> = {
      home: {
        title: 'Perkvex – Watch Free Movies, TV Shows & Anime in Ultra HD',
        desc: 'Stream thousands of blockbuster movies, full TV series, and trending anime in 4K & 1080p Ultra HD on Perkvex. 7 high-speed servers, stereo audio, and zero subscription.',
      },
      movies: {
        title: 'Watch Free Movies Online in 1080p & 4K HD – Perkvex Cinema',
        desc: 'Explore the latest box-office releases, action blockbusters, comedies, and classic cinema free in full HD on Perkvex. Zero buffer with direct VIP servers.',
      },
      tv: {
        title: 'Stream Full TV Shows & Complete Series Free Online – Perkvex',
        desc: 'Binge-watch complete TV seasons, trending series, and award-winning dramas with all episodes available in 1080p Ultra HD on Perkvex.',
      },
      anime: {
        title: 'Watch Trending Anime Online in HD with English Subtitles – Perkvex',
        desc: 'Watch top anime series, new seasonal episodes, and anime movies in crisp HD with multi-server playback on Perkvex.',
      },
      trending: {
        title: 'Top Trending Movies & Viral TV Shows Today – Perkvex',
        desc: 'Discover what everyone is watching right now. Daily updated top-rated movies, box-office hits, and trending TV series streaming free in 4K.',
      },
      watchlist: {
        title: 'My Free Cinema Watchlist – Perkvex',
        desc: 'Access your saved movies and TV shows anytime on Perkvex. Unlimited free cinema streaming.',
      },
      history: {
        title: 'Continue Watching & Stream History – Perkvex',
        desc: 'Pick up right where you left off. Continue watching your favorite movies and TV episodes on Perkvex.',
      },
    };

    const tabSeo = SEO_TAB_CONFIG[currentTab] || SEO_TAB_CONFIG.home;
    document.title = tabSeo.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', tabSeo.desc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', tabSeo.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', tabSeo.desc);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', tabSeo.title);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', tabSeo.desc);
  }, [currentTab, activeMedia]);

  // CPA 15-second timer reference
  const lockerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('flixstream_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('flixstream_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('flixstream_settings', JSON.stringify(settings));
  }, [settings]);

  // Clean legacy persistent unlock keys from localStorage so 10-second locker works on test sessions
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('unlocked_') || key.startsWith('flixstream_unlocked_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
  }, []);

  // Initial TMDB Data Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [trending, popMovies, popTV, topMovies, action, sciFi, animeList] = await Promise.all([
          fetchTrending('all', 'day'),
          fetchPopular('movie'),
          fetchPopular('tv'),
          fetchTopRated('movie'),
          fetchByGenre('movie', GENRE_MAP['Action'].movie),
          fetchByGenre('movie', GENRE_MAP['Sci-Fi'].movie),
          fetchAnime('all', 1),
        ]);

        setTrendingAll(trending);
        setTrendingMovies(trending.filter((i) => i.media_type === 'movie' || !i.first_air_date));
        setTrendingTV(popTV);
        setPopularMovies(popMovies);
        setTopRatedMovies(topMovies);
        setActionMovies(action);
        setSciFiMovies(sciFi);
        setAnimeCarouselItems(animeList);
        setAnimeCatalogItems(animeList);

        if (trending.length > 0) {
          // Choose an engaging movie/show with poster & backdrop for Hero
          const candidate = trending.find((i) => i.backdrop_path && i.overview) || trending[0];
          setHeroMedia(candidate);
        }
      } catch (err) {
        console.error('Error loading initial catalog data:', err);
      }
    };

    loadData();
  }, [settings.tmdbApiKey]);

  // Load Anime catalog when user switches to Anime tab or changes anime filter
  useEffect(() => {
    if (currentTab === 'anime') {
      setLoadingAnime(true);
      fetchAnime(animeFilter).then((items) => {
        setAnimeCatalogItems(items);
        setLoadingAnime(false);
      });
    }
  }, [currentTab, animeFilter]);

  // Handle category changes in trending/catalog
  const handleSelectCategory = async (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      setGenreFilteredItems([]);
      return;
    }

    const mapping = GENRE_MAP[category];
    if (mapping) {
      const genreId = catalogType === 'movie' ? mapping.movie : mapping.tv;
      const results = await fetchByGenre(catalogType, genreId);
      setGenreFilteredItems(results);
    }
  };

  // Watchlist Management
  const watchlistIds = new Set(watchlist.map((item) => item.id));

  const toggleWatchlist = (item: MediaItem) => {
    setWatchlist((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [item, ...prev];
      }
    });
  };

  // Record Stream History
  const addToHistory = (item: MediaItem, season = 1, episode = 1) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id);
      const isTv = item.media_type === 'tv' || !!item.first_air_date;
      const newEntry: WatchHistoryItem = {
        id: item.id,
        media: item,
        type: isTv ? 'tv' : 'movie',
        season: isTv ? season : undefined,
        episode: isTv ? episode : undefined,
        lastWatched: Date.now(),
      };
      return [newEntry, ...filtered].slice(0, 30);
    });
  };

  // Start Streaming handler
  const handlePlayMedia = (item: MediaItem, season = 1, episode = 1) => {
    setActiveMedia(item);
    setPlayerSeason(season);
    setPlayerEpisode(episode);
    setDetailMedia(null);
    addToHistory(item, season, episode);
  };

  // CPA Locker Stream Hook
  const handleStreamStarted = () => {
    // Media stream active
  };

  // Trigger test locker from settings
  const handleTriggerTestLocker = () => {
    triggerNativeOGAdsLocker();
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans">
      {/* Top Floating Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (activeMedia) {
            setActiveMedia(null);
          }
        }}
        onOpenMedia={(item) => {
          handlePlayMedia(item);
        }}
        onOpenSettings={() => setShowSettings(true)}
        watchlistCount={watchlist.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* If Active Player is Playing */}
        {activeMedia ? (
          <CinemaPlayer
            media={activeMedia}
            initialSeason={playerSeason}
            initialEpisode={playerEpisode}
            onBack={() => setActiveMedia(null)}
            onSelectSimilar={(item) => handlePlayMedia(item)}
            onStreamStarted={handleStreamStarted}
          />
        ) : (
          <>
            {/* View: Home */}
            {currentTab === 'home' && (
              <div className="space-y-6 pb-20">
                <HeroBanner
                  media={heroMedia}
                  onWatchNow={(item) => handlePlayMedia(item)}
                  onOpenInfo={(item) => setDetailMedia(item)}
                  onToggleWatchlist={toggleWatchlist}
                  isInWatchlist={heroMedia ? watchlistIds.has(heroMedia.id) : false}
                />

                {/* Continue Watching (if history exists) */}
                {history.length > 0 && (
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-red-500" />
                        <span>Continue Watching</span>
                      </h2>
                      <button
                        onClick={() => setCurrentTab('history')}
                        className="text-xs text-red-400 hover:text-red-300 transition"
                      >
                        View Full History ({history.length})
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                      {history.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handlePlayMedia(item.media, item.season, item.episode)}
                          className="group relative cursor-pointer bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-600 transition"
                        >
                          <div className="aspect-[2/3] w-full relative">
                            <img
                              src={getPosterUrl(item.media.poster_path, 'w500')}
                              alt={item.media.title || item.media.name || 'Poster'}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <div className="p-3 bg-[#e50914] text-white rounded-full shadow-lg">
                                <Play className="w-4 h-4 fill-white" />
                              </div>
                            </div>
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs font-semibold text-white truncate group-hover:text-red-400">
                              {item.media.title || item.media.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              {item.type === 'tv'
                                ? `Season ${item.season || 1}, Ep ${item.episode || 1}`
                                : 'Full Movie'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Trending Movies Carousel with Category Tabs */}
                <MediaCarousel
                  title="🔥 Trending Movies & TV Series"
                  subtitle="Top watched titles updated every hour"
                  items={genreFilteredItems.length > 0 ? genreFilteredItems : trendingAll}
                  onPlay={(item) => handlePlayMedia(item)}
                  onOpenDetails={(item) => setDetailMedia(item)}
                  onToggleWatchlist={toggleWatchlist}
                  watchlistIds={watchlistIds}
                  categories={CATEGORIES}
                  activeCategory={activeCategory}
                  onSelectCategory={handleSelectCategory}
                />

                {/* Popular Movies */}
                <MediaCarousel
                  title="🎬 Popular Blockbusters"
                  items={popularMovies}
                  onPlay={(item) => handlePlayMedia(item)}
                  onOpenDetails={(item) => setDetailMedia(item)}
                  onToggleWatchlist={toggleWatchlist}
                  watchlistIds={watchlistIds}
                />

                {/* Top Rated Cinema */}
                <MediaCarousel
                  title="⭐ All-Time Highest Rated (IMDb / TMDB)"
                  items={topRatedMovies}
                  onPlay={(item) => handlePlayMedia(item)}
                  onOpenDetails={(item) => setDetailMedia(item)}
                  onToggleWatchlist={toggleWatchlist}
                  watchlistIds={watchlistIds}
                />

                {/* TV Series Binge */}
                <MediaCarousel
                  title="📺 Binge-Worthy TV Series"
                  items={trendingTV}
                  onPlay={(item) => handlePlayMedia(item)}
                  onOpenDetails={(item) => setDetailMedia(item)}
                  onToggleWatchlist={toggleWatchlist}
                  watchlistIds={watchlistIds}
                />

                {/* Action & Adventure */}
                <MediaCarousel
                  title="💥 High-Octane Action & Thrillers"
                  items={actionMovies}
                  onPlay={(item) => handlePlayMedia(item)}
                  onOpenDetails={(item) => setDetailMedia(item)}
                  onToggleWatchlist={toggleWatchlist}
                  watchlistIds={watchlistIds}
                />

                {/* Sci-Fi */}
                <MediaCarousel
                  title="🚀 Sci-Fi & Mind-Benders"
                  items={sciFiMovies}
                  onPlay={(item) => handlePlayMedia(item)}
                  onOpenDetails={(item) => setDetailMedia(item)}
                  onToggleWatchlist={toggleWatchlist}
                  watchlistIds={watchlistIds}
                />

                {/* Anime Hits & Shonen Series */}
                <MediaCarousel
                  title="⛩️ Top Anime Series & Movies"
                  subtitle="Popular Japanese anime series, movies & latest seasons"
                  items={animeCarouselItems}
                  onPlay={(item) => handlePlayMedia(item)}
                  onOpenDetails={(item) => setDetailMedia(item)}
                  onToggleWatchlist={toggleWatchlist}
                  watchlistIds={watchlistIds}
                />
              </div>
            )}

            {/* View: Movies Catalog */}
            {currentTab === 'movies' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
                      <Film className="w-6 h-6 text-red-500" />
                      <span>Explore Movies</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                      Stream thousands of full-length films in 4K Ultra HD & 1080p
                    </p>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCatalogType('movie');
                          handleSelectCategory(cat);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-[#e50914] text-white shadow-md'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid of Movies */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {(genreFilteredItems.length > 0 ? genreFilteredItems : popularMovies).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setDetailMedia(item)}
                      className="group cursor-pointer space-y-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800 hover:border-red-600 transition"
                    >
                      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-black shadow">
                        <img
                          src={getPosterUrl(item.poster_path, 'w500')}
                          alt={item.title || 'Movie'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#e50914] text-white text-[9px] font-bold rounded">
                          HD
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayMedia(item);
                            }}
                            className="p-3 bg-[#e50914] text-white rounded-full shadow-lg hover:scale-110 transition"
                          >
                            <Play className="w-4 h-4 fill-white" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white truncate group-hover:text-red-400">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
                          <span>{(item.release_date || '').slice(0, 4)}</span>
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {item.vote_average?.toFixed(1) || '8.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: TV Shows Catalog */}
            {currentTab === 'tv' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
                      <Tv className="w-6 h-6 text-red-500" />
                      <span>TV Series & Shows</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                      Complete seasons and episodes with instant season/episode picker
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCatalogType('tv');
                          handleSelectCategory(cat);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-[#e50914] text-white shadow-md'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {(genreFilteredItems.length > 0 ? genreFilteredItems : trendingTV).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setDetailMedia(item)}
                      className="group cursor-pointer space-y-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800 hover:border-red-600 transition"
                    >
                      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-black shadow">
                        <img
                          src={getPosterUrl(item.poster_path, 'w500')}
                          alt={item.name || 'TV Show'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#e50914] text-white text-[9px] font-bold rounded">
                          TV
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayMedia(item);
                            }}
                            className="p-3 bg-[#e50914] text-white rounded-full shadow-lg hover:scale-110 transition"
                          >
                            <Play className="w-4 h-4 fill-white" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white truncate group-hover:text-red-400">
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
                          <span>{(item.first_air_date || '').slice(0, 4)}</span>
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {item.vote_average?.toFixed(1) || '8.2'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Anime Catalog */}
            {currentTab === 'anime' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-red-500" />
                      <span>Anime Universe (アニメ)</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                      Stream legendary Japanese anime series, movies, and all seasons in Full HD 1080p
                    </p>
                  </div>

                  {/* Filter Sub-Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {[
                      { id: 'all', label: 'All Anime' },
                      { id: 'series', label: 'Anime Series (TV)' },
                      { id: 'movies', label: 'Anime Movies' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setAnimeFilter(tab.id as 'all' | 'series' | 'movies')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer ${
                          animeFilter === tab.id
                            ? 'bg-[#e50914] text-white shadow-md'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingAnime ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-3">
                    <div className="w-10 h-10 rounded-full border-4 border-red-600/30 border-t-red-600 animate-spin" />
                    <p className="text-xs text-zinc-400">Loading top anime titles...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {animeCatalogItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setDetailMedia(item)}
                        className="group cursor-pointer space-y-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800 hover:border-red-600 transition"
                      >
                        <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-black shadow">
                          <img
                            src={getPosterUrl(item.poster_path, 'w500')}
                            alt={item.name || item.title || 'Anime'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#e50914] text-white text-[9px] font-bold rounded">
                            {item.media_type === 'tv' ? 'SERIES' : 'MOVIE'}
                          </div>
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[8px] font-black rounded uppercase">
                            SUB / DUB
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayMedia(item);
                              }}
                              className="p-3 bg-[#e50914] text-white rounded-full shadow-lg hover:scale-110 transition"
                            >
                              <Play className="w-4 h-4 fill-white" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white truncate group-hover:text-red-400">
                            {item.name || item.title}
                          </h3>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
                            <span>{(item.first_air_date || item.release_date || '').slice(0, 4)}</span>
                            <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {item.vote_average?.toFixed(1) || '8.5'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View: Trending */}
            {currentTab === 'trending' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 animate-fade-in">
                <div className="pb-4 border-b border-zinc-800">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
                    <Flame className="w-6 h-6 text-red-500" />
                    <span>Trending Right Now</span>
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    The most streamed titles in the world today on Perkvex
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {trendingAll.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setDetailMedia(item)}
                      className="group cursor-pointer relative space-y-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800 hover:border-red-600 transition"
                    >
                      {/* Rank Number Badge */}
                      <span className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-lg border border-white/20">
                        {idx + 1}
                      </span>

                      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-black shadow">
                        <img
                          src={getPosterUrl(item.poster_path, 'w500')}
                          alt={item.title || item.name || 'Poster'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayMedia(item);
                            }}
                            className="p-3 bg-[#e50914] text-white rounded-full shadow-lg hover:scale-110 transition"
                          >
                            <Play className="w-4 h-4 fill-white" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white truncate group-hover:text-red-400">
                          {item.title || item.name}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
                          <span>
                            {(item.release_date || item.first_air_date || '').slice(0, 4)}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {item.vote_average?.toFixed(1) || '8.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Watchlist */}
            {currentTab === 'watchlist' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
                      <Bookmark className="w-6 h-6 text-red-500" />
                      <span>My Watchlist</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                      {watchlist.length} saved title{watchlist.length === 1 ? '' : 's'} ready to stream
                    </p>
                  </div>
                  {watchlist.length > 0 && (
                    <button
                      onClick={() => setWatchlist([])}
                      className="text-xs text-zinc-400 hover:text-red-400 transition"
                    >
                      Clear List
                    </button>
                  )}
                </div>

                {watchlist.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                    <Bookmark className="w-12 h-12 text-zinc-700" />
                    <h3 className="text-lg font-bold text-zinc-300">Your Watchlist is Empty</h3>
                    <p className="text-xs text-zinc-500 max-w-sm">
                      Browse movies and TV shows and click the "+" icon to add them to your personalized streaming queue.
                    </p>
                    <button
                      onClick={() => setCurrentTab('home')}
                      className="px-5 py-2.5 bg-[#e50914] text-white text-xs font-bold rounded-xl transition hover:bg-red-700 cursor-pointer"
                    >
                      Browse Titles
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {watchlist.map((item) => (
                      <div
                        key={item.id}
                        className="group relative space-y-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800 hover:border-red-600 transition"
                      >
                        <div
                          onClick={() => setDetailMedia(item)}
                          className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-black shadow cursor-pointer"
                        >
                          <img
                            src={getPosterUrl(item.poster_path, 'w500')}
                            alt={item.title || item.name || 'Poster'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayMedia(item);
                              }}
                              className="p-3 bg-[#e50914] text-white rounded-full shadow-lg hover:scale-110 transition cursor-pointer"
                            >
                              <Play className="w-4 h-4 fill-white" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <h3
                            onClick={() => setDetailMedia(item)}
                            className="text-xs font-bold text-white truncate cursor-pointer hover:text-red-400"
                          >
                            {item.title || item.name}
                          </h3>
                          <button
                            onClick={() => toggleWatchlist(item)}
                            title="Remove from Watchlist"
                            className="p-1 text-zinc-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View: History */}
            {currentTab === 'history' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
                      <History className="w-6 h-6 text-red-500" />
                      <span>Watch History</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                      Pick up right where you left off across all 6 servers
                    </p>
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={() => setHistory([])}
                      className="text-xs text-zinc-400 hover:text-red-400 transition"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                    <History className="w-12 h-12 text-zinc-700" />
                    <h3 className="text-lg font-bold text-zinc-300">No Streaming History Yet</h3>
                    <p className="text-xs text-zinc-500 max-w-sm">
                      Start watching any movie or TV series and your watched history will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {history.map((entry) => (
                      <div
                        key={`${entry.id}-${entry.lastWatched}`}
                        onClick={() => handlePlayMedia(entry.media, entry.season, entry.episode)}
                        className="p-3 bg-[#181818] border border-zinc-800 hover:border-red-600 rounded-xl flex items-center gap-3 cursor-pointer group transition"
                      >
                        <img
                          src={getPosterUrl(entry.media.poster_path, 'w342')}
                          alt={entry.media.title || entry.media.name || 'Poster'}
                          className="w-14 h-20 object-cover rounded-lg shrink-0 bg-black"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400">
                            {entry.media.title || entry.media.name}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {entry.type === 'tv'
                              ? `Season ${entry.season || 1}, Ep ${entry.episode || 1}`
                              : 'Full-Length Feature'}
                          </p>
                          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-red-600/20 text-red-400 rounded font-semibold">
                            Resume Stream
                          </span>
                        </div>
                        <div className="p-2 text-zinc-500 group-hover:text-white transition">
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Rich SEO Content & FAQ Section for Search Engine Rankings */}
      <section className="border-t border-zinc-800/80 bg-[#0f0f0f] py-12 px-4 sm:px-6 lg:px-8 text-zinc-400">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Perkvex – Premier Free Cinema & TV Streaming Platform
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-4xl">
              Welcome to <strong className="text-white">Perkvex</strong>, your destination for streaming full-length movies, complete TV series seasons, and trending anime in pristine 1080p Full HD and 4K Ultra HD. Enjoy unlimited streaming with zero subscription fees, instant multi-mirror CDN playback, multi-language subtitles, and an anti-popup environment.
            </p>
          </div>

          {/* SEO Popular Keywords & Topics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Popular Free Streaming Categories
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Watch Free Movies Online',
                'Watch Action Movies HD',
                'Free TV Shows Streaming',
                'Trending Anime 2026',
                'Box Office Cinema 4K',
                'Sci-Fi Movies Online',
                'Watch Comedy Movies',
                'Horror Movies Free',
                'Top Rated IMDB Movies',
                'No Sign-Up Movie Streaming',
                'Ultra HD Cinema Players',
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-300 text-[11px] font-medium hover:border-red-600/50 transition cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* SEO FAQ Rich Accordion */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              Frequently Asked Questions (FAQ)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                <h4 className="font-bold text-white">How do I watch movies on Perkvex?</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Simply select any movie, TV show, or anime title from the catalog and click the red Play triangle. Your stream will launch instantly on high-speed CDN mirrors.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                <h4 className="font-bold text-white">What resolutions are supported?</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Perkvex supports 720p, 1080p Full HD, and 4K Ultra HD playback with high dynamic range audio, stereo surround sound, and multiple server switches.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                <h4 className="font-bold text-white">Is there an anti-popup shield?</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Yes, our player is protected by a strict sandbox and popup blocker to ensure an uninterrupted, clean cinema viewing experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 px-4 sm:px-6 lg:px-8 text-zinc-500 text-xs border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bebas tracking-wider text-[#e50914]">
              PERK<span className="text-white">VEX</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded font-mono">
              v1.0 ULTRA HD
            </span>
          </div>
          <p className="text-center md:text-left text-zinc-500 text-[11px]">
            Perkvex uses TMDB v3 API for media metadata and delivers high-performance 1080p / 4K streaming through 7 high-speed mirrors.
          </p>
          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setCurrentTab('watchlist')}
              className="hover:text-white transition cursor-pointer"
            >
              My List
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('history')}
              className="hover:text-white transition cursor-pointer"
            >
              Watch History
            </button>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">7 High-Speed Mirrors Online</span>
          </div>
        </div>
      </footer>

      {/* Media Detail Modal */}
      {detailMedia && (
        <MediaDetailModal
          media={detailMedia}
          onClose={() => setDetailMedia(null)}
          onPlay={(item) => handlePlayMedia(item)}
          onOpenTrailer={(item) => {
            setTrailerMedia(item);
          }}
          onToggleWatchlist={toggleWatchlist}
          isInWatchlist={watchlistIds.has(detailMedia.id)}
        />
      )}

      {/* Official YouTube Trailer Modal */}
      {trailerMedia && (
        <TrailerModal
          media={trailerMedia}
          onClose={() => setTrailerMedia(null)}
          onWatchNow={() => {
            handlePlayMedia(trailerMedia);
            setTrailerMedia(null);
            setDetailMedia(null);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
          onClose={() => setShowSettings(false)}
          onTriggerTestLocker={handleTriggerTestLocker}
        />
      )}
    </div>
  );
}
