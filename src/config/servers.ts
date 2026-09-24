import { StreamingServer } from '../types';

export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: 'vidsrcpm',
    name: 'Server 1: VidSrc PM (Fast CDN • Clean HTML5)',
    badge: 'DEFAULT VIP',
    quality: '1080p Full HD',
    speed: 'Instant CDN • Working',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.pm/embed/movie/${id}`
        : `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'streamimdb',
    name: 'Server 2: StreamIMDb (Fast Stream • Clean Play)',
    badge: 'STREAM IMDB',
    quality: '1080p Full HD',
    speed: 'Instant Play • No Sandbox Block',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1, imdbId?: string) => {
      const identifier = imdbId || id;
      return type === 'movie'
        ? `https://streamimdb.ru/embed/movie/${identifier}`
        : `https://streamimdb.ru/embed/tv/${identifier}/${season}/${episode}`;
    },
  },
  {
    id: 'vidsrcio',
    name: 'Server 3: VidSrc IO (Cloud CDN • Zero Lag)',
    badge: 'CLOUD CDN',
    quality: '1080p HD',
    speed: 'Instant Buffer • High Speed',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.io/embed/movie/${id}`
        : `https://vidsrc.io/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'vidsrcsh',
    name: 'Server 4: VidSrc SH (Direct High Speed Mirror)',
    badge: 'DIRECT MIRROR',
    quality: '1080p Full HD',
    speed: 'Fast CDN Mirror • Clean',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.sh/embed/movie?tmdb=${id}`
        : `https://vidsrc.sh/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
    },
  },
  {
    id: 'autoembed',
    name: 'Server 5: AutoEmbed (VidCore Direct CDN)',
    badge: 'AUTOEMBED',
    quality: '1080p Full HD',
    speed: 'Adaptive Bitrate • 1080p',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://autoembed.co/movie/tmdb/${id}`
        : `https://autoembed.co/tv/tmdb/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'vidsrcnet',
    name: 'Server 6: VidSrc Net (Global Edge Stream)',
    badge: 'GLOBAL CDN',
    quality: '1080p HD',
    speed: 'Global Edge • HTML5',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.net/embed/movie/${id}`
        : `https://vidsrc.net/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'multiembed',
    name: 'Server 7: MultiEmbed (Universal HD Mirror)',
    badge: 'MULTI-MIRROR',
    quality: '1080p HD',
    speed: 'Auto Multi-Mirror HD',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    },
  },
];
