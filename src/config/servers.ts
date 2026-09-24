import { StreamingServer } from '../types';

export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: 'vidsrc_pm',
    name: 'Server 1: VidSrc VIP (Fast CDN • 1080p)',
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
    id: 'vidlink_pro',
    name: 'Server 2: VidLink HD (Clean Stream • Zero Ads)',
    badge: 'CLEAN HD',
    quality: '1080p 60FPS',
    speed: 'High-Speed HLS • Multi-Sub',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'embed_su',
    name: 'Server 3: Embed.su (Cloud Stream • 4K Mirror)',
    badge: 'CLOUD 4K',
    quality: '4K / 1080p',
    speed: 'Global Edge • Instant Play',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'vidsrc_cc',
    name: 'Server 4: VidSrc CC (High Speed • Multi-Audio)',
    badge: 'TURBO HD',
    quality: '1080p Full HD',
    speed: 'Direct CDN • Zero Lag',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'multiembed_mov',
    name: 'Server 5: MultiEmbed (Universal Global Mirror)',
    badge: 'MULTI-AUDIO',
    quality: '1080p HD',
    speed: 'Multi-Source • Fast Buffer',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'vidsrc_net',
    name: 'Server 6: VidSrc Net (High Bandwidth Mirror)',
    badge: 'RED VIP',
    quality: '1080p HD',
    speed: 'Cinema Audio • Backup Node',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://vidsrc.net/embed/movie/${id}`
        : `https://vidsrc.net/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'autoembed_co',
    name: 'Server 7: AutoEmbed Pro (Direct Clean Mirror)',
    badge: 'BACKUP DIRECT',
    quality: '1080p HD',
    speed: 'Reliable Mirror • Instant Buffer',
    isReliable: true,
    getUrl: (type, id, season = 1, episode = 1) => {
      return type === 'movie'
        ? `https://autoembed.co/movie/tmdb/${id}`
        : `https://autoembed.co/tv/tmdb/${id}/${season}/${episode}`;
    },
  },
];
