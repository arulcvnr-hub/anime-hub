-- AnimeHub Offline Vault SQLite Database Schema
-- Optimized for local low-latency indexing, progress sync, and media assets.

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. Anime Series Table
CREATE TABLE IF NOT EXISTS anime (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    japanese_title TEXT,
    romaji_title TEXT,
    synopsis TEXT,
    year INTEGER DEFAULT 2026,
    rating REAL DEFAULT 9.0,
    rating_count INTEGER DEFAULT 0,
    episodes_count INTEGER DEFAULT 12,
    status TEXT DEFAULT 'Completed',
    studio TEXT DEFAULT 'Studio Triggerhead',
    genres TEXT DEFAULT 'Action,Cyberpunk,Sci-Fi',
    poster_url TEXT,
    banner_url TEXT,
    storage_path TEXT,
    quality TEXT DEFAULT '1080p FHD',
    audio_type TEXT DEFAULT 'Dual FLAC 2.0',
    size_gb REAL DEFAULT 10.0,
    download_status TEXT DEFAULT 'Downloaded (1080p)',
    is_favorite BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Episodes Table
CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY,
    anime_id TEXT NOT NULL,
    episode_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    synopsis TEXT,
    duration INTEGER DEFAULT 1440,
    progress_seconds INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0,
    download_status TEXT DEFAULT 'ready',
    file_size_mb REAL DEFAULT 420.0,
    video_path TEXT,
    subtitle_path TEXT,
    thumbnail_url TEXT,
    FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
);

-- 3. Watch Progress State (lossless resume across offline sessions)
CREATE TABLE IF NOT EXISTS watch_progress (
    episode_id TEXT PRIMARY KEY,
    anime_id TEXT NOT NULL,
    progress_seconds INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
);

-- 4. Vault Download Queue & Stored Partition Records
CREATE TABLE IF NOT EXISTS vault_downloads (
    id TEXT PRIMARY KEY,
    anime_id TEXT NOT NULL,
    episode_id TEXT,
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_mb REAL NOT NULL,
    downloaded_bytes REAL NOT NULL,
    status TEXT NOT NULL, -- 'downloaded', 'downloading', 'paused', 'queued'
    transfer_speed_mbps REAL DEFAULT 0,
    quality TEXT DEFAULT '1080p HEVC AAC',
    storage_location TEXT,
    checksum_verified BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for instant offline query performance
CREATE INDEX IF NOT EXISTS idx_episodes_anime ON episodes(anime_id, episode_number);
CREATE INDEX IF NOT EXISTS idx_progress_anime ON watch_progress(anime_id);
CREATE INDEX IF NOT EXISTS idx_vault_status ON vault_downloads(status);
