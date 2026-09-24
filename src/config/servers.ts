import { StreamingServer } from '../types';

export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: '123embed',
    name: 'Server 1: 123Embed Ultra HD',
    badge: '4K Ultra HD',
    quality: '4K / 1080p',
    speed: 'Ultra Fast',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://play2.123embed.net/movie/${id}`
        : `https://play2.123embed.net/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'anyembed',
    name: 'Server 2: AnyEmbed (Smashy)',
    badge: 'VIP Stream',
    quality: '1080p Full HD',
    speed: 'High Speed',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://anyembed.xyz/embed/movie/${id}`
        : `https://anyembed.xyz/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'autoembed',
    name: 'Server 3: AutoEmbed CC',
    badge: 'Multi-Audio',
    quality: '1080p / 720p',
    speed: 'Stable CDN',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://player.autoembed.cc/embed/movie/${id}`
        : `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'videasy',
    name: 'Server 4: Videasy HD',
    badge: 'Zero Buffer',
    quality: '1080p HD',
    speed: 'Fast CDN',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://player.videasy.net/movie/${id}`
        : `https://player.videasy.net/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'vidsrc',
    name: 'Server 5: VidSrc Prime',
    badge: 'Primary Server',
    quality: '1080p HD',
    speed: 'High Bandwidth',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: '2embed',
    name: 'Server 6: 2Embed Cinema',
    badge: 'Backup HD',
    quality: '1080p / 720p',
    speed: 'Global CDN',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    },
  },
];
