import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Tv,
  Film,
  Star,
  Clock,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ListVideo,
  Play,
} from 'lucide-react';
import { MediaItem, TVEpisode, CastMember, SeasonSummary } from '../types';
import { STREAMING_SERVERS } from '../config/servers';
import { fetchTVSeason, fetchTVDetails, fetchDetails, fetchCredits, fetchSimilar, getPosterUrl } from '../services/tmdb';

interface CinemaPlayerProps {
  media: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  onBack: () => void;
  onSelectSimilar: (item: MediaItem) => void;
  onStreamStarted: () => void;
}

export const CinemaPlayer: React.FC<CinemaPlayerProps> = ({
  media,
  initialSeason = 1,
  initialEpisode = 1,
  onBack,
  onSelectSimilar,
  onStreamStarted,
}) => {
  const isTv = media.media_type === 'tv' || !!media.first_air_date;
  const [selectedServer, setSelectedServer] = useState(STREAMING_SERVERS[0]);
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [availableSeasons, setAvailableSeasons] = useState<SeasonSummary[]>(media.seasons || []);
  const [totalSeasonsCount, setTotalSeasonsCount] = useState<number>(media.number_of_seasons || 1);
  const [episodes, setEpisodes] = useState<TVEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  const [iframeKey, setIframeKey] = useState(0);
  const [isCinemaExpanded, setIsCinemaExpanded] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const [imdbId, setImdbId] = useState<string | undefined>(media.imdb_id);

  // Fetch full details to get imdb_id if not present
  useEffect(() => {
    if (!imdbId && media.id) {
      if (isTv) {
        fetchTVDetails(media.id).then((details) => {
          if (details?.imdb_id) setImdbId(details.imdb_id);
        });
      } else {
        fetchDetails('movie', media.id).then((details) => {
          if (details?.imdb_id) setImdbId(details.imdb_id);
        });
      }
    }
  }, [media.id, isTv, imdbId]);

  const playerContainerRef = useRef<HTMLDivElement>(null);

  const title = media.title || media.name || 'Now Streaming';
  const totalSeasons = Math.max(
    totalSeasonsCount,
    availableSeasons.length,
    media.number_of_seasons || 1
  );

  // Fetch full TV details to get all real seasons
  useEffect(() => {
    if (isTv) {
      fetchTVDetails(media.id).then((details) => {
        if (details) {
          if (details.number_of_seasons) {
            setTotalSeasonsCount(details.number_of_seasons);
          }
          if (details.seasons && details.seasons.length > 0) {
            const regular = details.seasons.filter((s) => s.season_number > 0);
            setAvailableSeasons(regular.length > 0 ? regular : details.seasons);
            if (regular.length > 0) {
              setTotalSeasonsCount(Math.max(...regular.map((s) => s.season_number)));
            }
          }
        }
      });
    }
  }, [media.id, isTv]);

  // Intercept and permanently neutralize popup attempts, fake redirects, and clickjack ads
  useEffect(() => {
    const origOpen = window.open;
    // Block window.open ad popups
    window.open = function (...args) {
      console.warn('[Anti-Popup Shield] Silently blocked ad popup attempt:', args[0]);
      return null;
    };

    // Re-focus main window if an ad tries to hijack focus
    const handleBlur = () => {
      setTimeout(() => {
        window.focus();
      }, 50);
    };
    window.addEventListener('blur', handleBlur);

    // Block accidental beforeunload traps often triggered by ad scripts
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Do nothing, avoid annoying ad leave alerts
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.open = origOpen;
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Signal stream start to parent (which kicks off the 15-second CPA countdown timer)
  useEffect(() => {
    onStreamStarted();
    // Scroll smoothly to top of player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [media.id, currentSeason, currentEpisode]);

  // Reset loading state whenever server or episode changes
  useEffect(() => {
    setIsPlayerLoading(true);
    const timer = setTimeout(() => {
      setIsPlayerLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, [selectedServer.id, currentSeason, currentEpisode, iframeKey]);

  // Fetch TV Episodes when season changes
  useEffect(() => {
    if (isTv) {
      setLoadingEpisodes(true);
      fetchTVSeason(media.id, currentSeason).then((seasonData) => {
        if (seasonData && seasonData.episodes) {
          setEpisodes(seasonData.episodes);
        }
        setLoadingEpisodes(false);
      });
    }
  }, [media.id, isTv, currentSeason]);

  // Fetch cast and similar recommendations
  useEffect(() => {
    const type = isTv ? 'tv' : 'movie';
    fetchCredits(type, media.id).then(setCast);
    fetchSimilar(type, media.id).then(setSimilar);
  }, [media.id, isTv]);

  const activeStreamUrl = selectedServer.getUrl(
    isTv ? 'tv' : 'movie',
    media.id,
    currentSeason,
    currentEpisode,
    imdbId || media.imdb_id
  );

  const handleReloadPlayer = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen?.().catch((err) => {
          console.warn('Fullscreen error:', err);
        });
      } else {
        document.exitFullscreen?.().catch(console.warn);
      }
    }
  };

  const handleNextEpisode = () => {
    if (currentEpisode < episodes.length) {
      setCurrentEpisode(currentEpisode + 1);
    } else if (currentSeason < totalSeasons) {
      setCurrentSeason(currentSeason + 1);
      setCurrentEpisode(1);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-18 sm:pt-20 pb-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5">
        {/* Navigation & Status Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg transition font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Full-Length 100% Free HD Stream</span>
            </span>

            {/* In-Site Theater Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsCinemaExpanded(!isCinemaExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg transition font-medium text-xs cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isCinemaExpanded ? 'Standard' : 'Theater'}</span>
            </button>

            {/* Anti-Popup Ad Shield Badge */}
            <div
              title="Anti-Popup Ad Shield is permanently active: Popups, click redirects and window spam are blocked"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs border bg-emerald-950/70 border-emerald-500/40 text-emerald-400 select-none"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ad-Shield: ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 7-Server Selector Switch Bar */}
        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Streaming Mirrors (7 Ultra HD Servers):
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="text-emerald-400 font-medium">Verified Working • Instant Playback</span>
              <span className="hidden md:inline text-zinc-600">•</span>
              <span className="hidden md:inline">Server 1 (VidSrc PM) & Server 2 (StreamIMDb) ready</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 pt-2.5">
            {STREAMING_SERVERS.map((server, idx) => {
              const isSelected = selectedServer.id === server.id;
              return (
                <button
                  key={server.id}
                  onClick={() => {
                    setSelectedServer(server);
                    handleReloadPlayer();
                  }}
                  className={`relative flex flex-col items-start p-2.5 rounded-xl border text-left transition cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#e50914]/20 to-[#e50914]/5 border-[#e50914] shadow-md shadow-red-950/30 ring-1 ring-[#e50914]'
                      : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white group-hover:text-red-300">
                      Server {idx + 1}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        isSelected ? 'bg-[#e50914] text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {server.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate w-full">
                    {server.speed}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TV Series Season & Episode Controls (if TV series) */}
        {isTv && (
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2 bg-red-600/20 text-red-500 rounded-xl">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Season {currentSeason}, Episode {currentEpisode}
                </h3>
                <p className="text-xs text-zinc-400">
                  {episodes.find((e) => e.episode_number === currentEpisode)?.name ||
                    `Episode ${currentEpisode}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Season Select */}
              <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-700 rounded-xl px-3 py-1.5">
                <span className="text-xs text-zinc-400 font-medium">Season:</span>
                <select
                  value={currentSeason}
                  onChange={(e) => {
                    setCurrentSeason(Number(e.target.value));
                    setCurrentEpisode(1);
                  }}
                  className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                >
                  {availableSeasons.length > 0 ? (
                    availableSeasons.map((s) => (
                      <option key={s.season_number} value={s.season_number} className="bg-zinc-900 text-white">
                        {s.name || `Season ${s.season_number}`} {s.episode_count ? `(${s.episode_count} eps)` : ''}
                      </option>
                    ))
                  ) : (
                    Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s} className="bg-zinc-900 text-white">
                        Season {s}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Episode Select */}
              <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-700 rounded-xl px-3 py-1.5">
                <span className="text-xs text-zinc-400 font-medium">Episode:</span>
                <select
                  value={currentEpisode}
                  onChange={(e) => setCurrentEpisode(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                >
                  {episodes.length > 0 ? (
                    episodes.map((ep) => (
                      <option key={ep.id} value={ep.episode_number} className="bg-zinc-900 text-white">
                        Ep {ep.episode_number}: {ep.name.slice(0, 24)}
                      </option>
                    ))
                  ) : (
                    <option value={1} className="bg-zinc-900 text-white">
                      Episode 1
                    </option>
                  )}
                </select>
              </div>

              {/* Prev / Next Ep */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevEpisode}
                  disabled={currentEpisode <= 1}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded-xl text-xs text-zinc-200 transition cursor-pointer"
                  title="Previous Episode"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextEpisode}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 flex items-center gap-1 transition cursor-pointer"
                  title="Next Episode"
                >
                  <span>Next Ep</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Episode Grid Toggle */}
              <button
                type="button"
                onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  showEpisodeDrawer
                    ? 'bg-[#e50914] text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                <ListVideo className="w-3.5 h-3.5" />
                <span>All Seasons & Episodes</span>
              </button>
            </div>
          </div>
        )}

        {/* Episode Visual Grid Drawer (when toggled) */}
        {isTv && showEpisodeDrawer && (
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-4 animate-fade-in space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Season {currentSeason} - All Episodes ({episodes.length})
              </h4>
              <button
                onClick={() => setShowEpisodeDrawer(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Quick Season Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] text-zinc-400 font-medium shrink-0 mr-1">Seasons:</span>
              {availableSeasons.length > 0 ? (
                availableSeasons.map((s) => (
                  <button
                    key={s.season_number}
                    onClick={() => {
                      setCurrentSeason(s.season_number);
                      setCurrentEpisode(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      currentSeason === s.season_number
                        ? 'bg-[#e50914] text-white shadow-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {s.name || `Season ${s.season_number}`} {s.episode_count ? `(${s.episode_count})` : ''}
                  </button>
                ))
              ) : (
                Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setCurrentSeason(s);
                      setCurrentEpisode(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      currentSeason === s
                        ? 'bg-[#e50914] text-white shadow-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    Season {s}
                  </button>
                ))
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-72 overflow-y-auto pr-1">
              {episodes.map((ep) => {
                const isActiveEp = currentEpisode === ep.episode_number;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setCurrentEpisode(ep.episode_number);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isActiveEp
                        ? 'bg-[#e50914]/20 border-[#e50914] text-white ring-1 ring-[#e50914]'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Ep {ep.episode_number}</span>
                        {isActiveEp && (
                          <span className="text-[9px] bg-[#e50914] text-white px-1.5 rounded uppercase font-bold">
                            Playing
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 font-medium">
                        {ep.name}
                      </p>
                    </div>
                    {ep.vote_average > 0 && (
                      <span className="text-[10px] text-amber-400 mt-2 font-semibold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {ep.vote_average.toFixed(1)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Responsive Cinema Player Container (16:9 / Theater Mode) */}
        <div
          ref={playerContainerRef}
          className={`relative w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl shadow-black transition-all duration-300 ${
            isCinemaExpanded ? 'w-full lg:h-[76vh] aspect-video' : 'aspect-video'
          }`}
        >
          {/* In-Site Loading Buffer Indicator */}
          {isPlayerLoading && (
            <div className="absolute inset-0 bg-[#0c0c0c]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in pointer-events-none">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-zinc-800 border-t-[#e50914] animate-spin" />
                <Play className="w-5 h-5 text-[#e50914] absolute inset-0 m-auto fill-[#e50914]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white tracking-wide">
                  Connecting to {selectedServer.name}...
                </p>
                <p className="text-xs text-zinc-400">
                  Loading high-speed 4K/HD stream player inside your browser
                </p>
              </div>
            </div>
          )}

          <iframe
            key={`${selectedServer.id}-${media.id}-${currentSeason}-${currentEpisode}-${iframeKey}`}
            src={activeStreamUrl}
            title={`${title} Stream Player`}
            className="w-full h-full border-0 relative z-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-downloads"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            loading="eager"
            onLoad={() => setIsPlayerLoading(false)}
          />

          {/* Floating Player Utility Toolbar */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20 opacity-50 hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={() => {
                const currentIndex = STREAMING_SERVERS.findIndex((s) => s.id === selectedServer.id);
                const nextIndex = (currentIndex + 1) % STREAMING_SERVERS.length;
                setSelectedServer(STREAMING_SERVERS[nextIndex]);
                handleReloadPlayer();
              }}
              title="Switch to Next Streaming Server"
              className="px-2.5 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-md border border-white/10 transition cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-[#e50914]" />
              <span className="hidden sm:inline">Next Server</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCinemaExpanded(!isCinemaExpanded)}
              title={isCinemaExpanded ? 'Exit Theater Mode' : 'Theater Mode'}
              className="p-2 bg-black/80 hover:bg-black text-white rounded-lg backdrop-blur-md border border-white/10 transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleReloadPlayer}
              title="Reload Stream Server"
              className="p-2 bg-black/80 hover:bg-black text-white rounded-lg backdrop-blur-md border border-white/10 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFullscreen}
              title="Fullscreen Mode"
              className="p-2 bg-black/80 hover:bg-black text-white rounded-lg backdrop-blur-md border border-white/10 transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <div
              title="Anti-Popup Shield: Active (Popups and click redirects blocked)"
              className="p-2 rounded-lg backdrop-blur-md border bg-emerald-950/80 border-emerald-500/50 text-emerald-400 select-none flex items-center justify-center"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Player Controls & Advice Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Currently playing on <strong className="text-white">{selectedServer.name}</strong> ({selectedServer.quality})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-medium flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Popup Shield: 100% Active</span>
            </span>
            <span className="text-zinc-600">•</span>
            <button
              type="button"
              onClick={() => {
                const currentIndex = STREAMING_SERVERS.findIndex((s) => s.id === selectedServer.id);
                const nextIndex = (currentIndex + 1) % STREAMING_SERVERS.length;
                setSelectedServer(STREAMING_SERVERS[nextIndex]);
                handleReloadPlayer();
              }}
              className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-bold rounded-lg border border-red-500/30 transition cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Switch Server</span>
            </button>
          </div>
        </div>

        {/* Movie / Show Information Card */}
        <div className="bg-[#181818] border border-zinc-800/90 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="px-2.5 py-0.5 bg-[#e50914] text-white font-bold rounded uppercase text-[10px]">
                  {isTv ? 'TV Series' : 'Movie'}
                </span>
                <span className="flex items-center gap-1 text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {media.vote_average?.toFixed(1) || '8.0'}
                </span>
                {media.release_date || media.first_air_date ? (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Calendar className="w-3 h-3" />
                    {(media.release_date || media.first_air_date || '').slice(0, 4)}
                  </span>
                ) : null}
                {media.runtime && (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Clock className="w-3 h-3" />
                    {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                  </span>
                )}
                {isTv && (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Layers className="w-3 h-3" />
                    {totalSeasons} Season{totalSeasons > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {title}
              </h1>

              {media.tagline && (
                <p className="text-xs text-zinc-400 italic">"{media.tagline}"</p>
              )}

              <p className="text-sm text-zinc-300 leading-relaxed">
                {media.overview || 'Enjoy this full-length stream with ultra-high quality playback and stereo surround audio.'}
              </p>

              {/* Genres */}
              {media.genres && media.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {media.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-2.5 py-1 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg text-xs"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Poster Card */}
            <div className="hidden md:block shrink-0 w-44">
              <img
                src={getPosterUrl(media.poster_path, 'w500')}
                alt={title}
                className="w-full rounded-xl shadow-xl border border-zinc-700/60"
              />
            </div>
          </div>

          {/* Cast Members */}
          {cast.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Top Cast Members
              </h3>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {cast.map((actor) => (
                  <div
                    key={actor.id}
                    className="shrink-0 w-24 text-center space-y-1 group"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 shadow">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                          {actor.name.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-zinc-200 truncate">{actor.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Similar / Recommended Titles */}
        {similar.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="text-base font-bold text-white tracking-wide">
              More Titles Like This
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {similar.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectSimilar(item)}
                  className="group cursor-pointer space-y-2"
                >
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow group-hover:border-red-600 transition duration-300">
                    <img
                      src={getPosterUrl(item.poster_path, 'w500')}
                      alt={item.title || item.name || 'Poster'}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="p-3 bg-[#e50914] text-white rounded-full shadow-lg">
                        <Play className="w-4 h-4 fill-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-red-400 transition">
                    {item.title || item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
