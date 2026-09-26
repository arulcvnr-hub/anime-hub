export interface AnimeShow {
  id: string;
  title: string;
  japanese_title?: string;
  romaji_title?: string;
  synopsis: string;
  year: number;
  rating: number;
  rating_count: number;
  episodes_count: number;
  status: string;
  studio: string;
  genres: string;
  genres_list?: string[];
  poster_url: string;
  banner_url: string;
  storage_path: string;
  quality: string;
  audio_type: string;
  size_gb: number;
  download_status: string;
  is_favorite: boolean | number;
  created_at?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  anime_id: string;
  episode_number: number;
  title: string;
  synopsis: string;
  duration: number; // in seconds
  progress_seconds: number;
  is_completed: boolean | number;
  download_status: string; // 'ready', 'downloaded', 'downloading'
  file_size_mb: number;
  video_path: string;
  subtitle_path?: string;
  thumbnail_url: string;
  watch_progress?: {
    progress_seconds: number;
    duration_seconds: number;
    updated_at: string;
  };
}

export interface VaultItem {
  id: string;
  anime_id: string;
  episode_id?: string;
  title: string;
  file_name: string;
  file_size_mb: number;
  downloaded_bytes: number;
  status: 'completed' | 'downloading' | 'paused' | 'queued';
  transfer_speed_mbps: number;
  quality: string;
  storage_location: string;
  checksum_verified: boolean | number;
  created_at?: string;
}

export interface StorageStatus {
  total_gb: number;
  used_gb: number;
  vault_cache_gb: number;
  free_gb: number;
  usage_percentage: number;
  status: string;
}

export interface DaemonInfo {
  daemon: string;
  engine: string;
  database: string;
  hardware_decoding: string;
  stream_protocol: string;
  subtitles_format: string;
  host: string;
  status: string;
}
