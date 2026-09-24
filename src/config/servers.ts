import { StreamingServer } from '../types';

export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: 'vidsrc_pm',
    name: 'Server 1: VIP Ultra HD (Fast CDN • 1080p)',
    badge: 'DEFAULT VIP',
    quality: '1080p Full HD',
    speed: 'Instant CDN • Ultra Fast',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.pm/embed/movie/${id}`
        : `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'vidsrc_pm_turbo',
    name: 'Server 2: Turbo Direct (Auto Play • Zero Lag)',
    badge: 'TURBO DIRECT',
    quality: '1080p 60FPS',
    speed: 'Instant Stream • Direct Buffer',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.pm/embed/movie/${id}?autoplay=1`
        : `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}?autoplay=1`;
    },
  },
  {
    id: 'vidsrc_pm_en',
    name: 'Server 3: Cinema Multi-Audio (Multi-Sub Mirror)',
    badge: 'CINEMA AUDIO',
    quality: '1080p HD',
    speed: 'Cinema Audio • Fast Mirror',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.pm/embed/movie/${id}?ds_lang=en`
        : `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}?ds_lang=en`;
    },
  },
];
