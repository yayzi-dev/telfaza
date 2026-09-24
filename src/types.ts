export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  media_type?: 'movie' | 'tv';
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  status?: string;
  seasons?: SeasonSummary[];
  imdb_id?: string;
}

export interface SeasonSummary {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date?: string;
  overview?: string;
}

export interface TVSeasonDetails {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  episodes: TVEpisode[];
}

export interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string;
  vote_average: number;
  runtime?: number;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface StreamingServer {
  id: string;
  name: string;
  badge: string;
  quality: string;
  speed: string;
  isReliable: boolean;
  getUrl: (type: 'movie' | 'tv', id: number, season?: number, episode?: number, imdbId?: string) => string;
}

export interface WatchHistoryItem {
  id: number;
  media: MediaItem;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  lastWatched: number;
}

export interface AppSettings {
  tmdbApiKey: string;
  lockerEnabled: boolean;
  lockerId: string;
  lockerDelaySeconds: number;
}
