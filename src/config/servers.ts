import { StreamingServer } from '../types';

export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: 'yapgrid',
    name: 'Server 1: YapGrid Ultra (Ad-Free 4K)',
    badge: 'DEFAULT HD',
    quality: '4K / 1080p Ultra HD',
    speed: 'Instant Play',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://yapgrid.com/embed/movie/${id}`
        : `https://yapgrid.com/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'autoembed',
    name: 'Server 2: AutoEmbed HD (High Speed)',
    badge: 'FAST CDN',
    quality: '1080p Full HD',
    speed: 'Zero Buffer',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://autoembed.co/movie/tmdb/${id}`
        : `https://autoembed.co/tv/tmdb/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'multiembed',
    name: 'Server 3: MultiEmbed VIP (Multi-Source)',
    badge: 'MULTI-AUDIO',
    quality: '1080p HD',
    speed: 'Global CDN',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    },
  },
  {
    id: '2embed',
    name: 'Server 4: 2Embed Cinema (Classic HD)',
    badge: 'CINEMA HQ',
    quality: '1080p HD',
    speed: 'Direct CDN',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'smashy',
    name: 'Server 5: Smashy VIP (Zero Lag)',
    badge: 'ULTRA STABLE',
    quality: '1080p / 720p',
    speed: 'High Speed CDN',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}`
        : `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`;
    },
  },
  {
    id: 'vidsrc',
    name: 'Server 6: VidSrc VIP (Backup Direct)',
    badge: 'BACKUP VIP',
    quality: '1080p HD',
    speed: 'Cloud Mirror',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    },
  },
];
