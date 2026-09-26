#!/usr/bin/env python3
"""
Database Initializer and Seeder for AnimeHub Local Vault
Initializes SQLite tables and seeds rich anime catalog, episodes, and progress.
"""
import sqlite3
import os

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database')
DB_PATH = os.path.join(DB_DIR, 'anime_vault.db')
SCHEMA_PATH = os.path.join(DB_DIR, 'schema.sql')

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Read and execute schema
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            cursor.executescript(f.read())
    else:
        # Fallback inline schema
        cursor.executescript("""
        CREATE TABLE IF NOT EXISTS anime (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            japanese_title TEXT,
            romaji_title TEXT,
            synopsis TEXT,
            year INTEGER,
            rating REAL,
            rating_count INTEGER,
            episodes_count INTEGER,
            status TEXT,
            studio TEXT,
            genres TEXT,
            poster_url TEXT,
            banner_url TEXT,
            storage_path TEXT,
            quality TEXT,
            audio_type TEXT,
            size_gb REAL,
            download_status TEXT DEFAULT 'Downloaded',
            is_favorite BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS episodes (
            id TEXT PRIMARY KEY,
            anime_id TEXT NOT NULL,
            episode_number INTEGER NOT NULL,
            title TEXT NOT NULL,
            synopsis TEXT,
            duration INTEGER,
            progress_seconds INTEGER DEFAULT 0,
            is_completed BOOLEAN DEFAULT 0,
            download_status TEXT DEFAULT 'ready',
            file_size_mb REAL,
            video_path TEXT,
            subtitle_path TEXT,
            thumbnail_url TEXT,
            FOREIGN KEY (anime_id) REFERENCES anime(id)
        );

        CREATE TABLE IF NOT EXISTS watch_progress (
            episode_id TEXT PRIMARY KEY,
            anime_id TEXT NOT NULL,
            progress_seconds INTEGER NOT NULL,
            duration_seconds INTEGER NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (episode_id) REFERENCES episodes(id)
        );

        CREATE TABLE IF NOT EXISTS vault_downloads (
            id TEXT PRIMARY KEY,
            anime_id TEXT NOT NULL,
            episode_id TEXT,
            title TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_size_mb REAL NOT NULL,
            downloaded_bytes REAL NOT NULL,
            status TEXT NOT NULL,
            transfer_speed_mbps REAL DEFAULT 0,
            quality TEXT,
            storage_location TEXT,
            checksum_verified BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

    # Seed Anime
    anime_list = [
        (
            "neo-ronin",
            "Neo Ronin: Cyber Attack",
            "紅の斬撃",
            "Kurenai no Zangeki",
            "In rain-drenched Neo-Tokyo, rogue cybernetic Ronin Ren fights through synthetic syndicates to reclaim stolen organic memories. Armed with a photonic plasma katana and illicit neural implants, she cuts through high-tech megacorporations controlling the rainy neon underworld.",
            2026,
            9.2,
            2420,
            24,
            "Completed",
            "Studio Triggerhead",
            "Action,Cyberpunk,Sci-Fi,Fantasy,Seinen",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCvjWSn3MMyaOmHYEXuqvkjLA3CldKanPAUzp0MhxAQ4razLBacmwLsrGmzB4VQOcqVbOWGb9iSlh1ykjS9b5Bva1zgeomL11u06W5n4kFcIVpSxgsY_4Cc4Z35wZKXvBwVwgKXnyjPqn678vdgqSHMbAQ6nSeHniOze2gMyklqdQ9-dfBsYs7N7vQcmGNUbYxlpQXPoYgSNVxK_OWXFbFbVfwP2q3rsQveCS6_hk7vqhs3fAph07nNJg",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBYc-bQt0Yp0dICzsvfQmdz2sl8Myol6LGNy9z17ZxUoPqulzuJjT_xjb7lvEWei65garpa06bVxMkyKALaSnHX6VEmQ93UVSVaKx9WQIsiICfJ_M8Z66gw00EK8bN4kFg8-IAHUHDJi0dQueGo9-iA7BU03g1WG03UYuX4UTpXFyeuRgK-6K55wtgw9AEdGERWyuGXW-XdMPxMPYClBKLM8xVeMTF_tJv4xnPUhUWtRewDe5kh2ZKZ9A",
            "media/videos/Neo_Ronin/",
            "1080p Ultra",
            "Dual FLAC 2.0",
            14.8,
            "Downloaded (1080p)",
            1
        ),
        (
            "cyber-knights",
            "Cyber Knights: Arkham",
            "電脳の騎士",
            "Cyber Knights",
            "Elite counter-syndicate snipers wage war in the mist of Neo-Tokyo's upper troposphere corridors against corrupt autonomous AI military constructs.",
            2026,
            8.9,
            1840,
            12,
            "Completed",
            "Production I.G. Vision",
            "Thriller,Cyber,Action,Sci-Fi",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBu-7cOnCCVnfLcbQMmBunH3nqBRekTYSh5RJpK95SgUtj7SzZt1x0EjlZRrQoyre3e4S-CxwH-4xb6SRiCJIEBwKl72CdjFOgPf06I4Np0ILhkTVKL0-NNZAA0x9lBJCpvN9onL5rBtyO_pqsWrG8j-aTQJoW76T_zGTZLwyVHZnZ78JqjCFwY_gB_PXIAhKidAxLcWW1QKbn5owj_c1hf_RcG32HkrypU5tx6NeqK-Y9zJPNugFys7w",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBu-7cOnCCVnfLcbQMmBunH3nqBRekTYSh5RJpK95SgUtj7SzZt1x0EjlZRrQoyre3e4S-CxwH-4xb6SRiCJIEBwKl72CdjFOgPf06I4Np0ILhkTVKL0-NNZAA0x9lBJCpvN9onL5rBtyO_pqsWrG8j-aTQJoW76T_zGTZLwyVHZnZ78JqjCFwY_gB_PXIAhKidAxLcWW1QKbn5owj_c1hf_RcG32HkrypU5tx6NeqK-Y9zJPNugFys7w",
            "media/videos/Cyber_Knights/",
            "1080p FHD",
            "AAC 5.1",
            8.2,
            "Downloaded (1080p)",
            0
        ),
        (
            "mecha-soul",
            "Mecha Soul: Valkyrie",
            "鋼鉄の乙女",
            "Mecha Soul Valkyrie",
            "Pilots synchronizing their cerebral matrices with experimental Type-01 Vanguard Titans battle cataclysmic tempest storms unleashed by orbital weapon arrays.",
            2025,
            9.4,
            3120,
            18,
            "Airing",
            "Sunrise Titanium",
            "Mecha,Military,Sci-Fi,Action",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAk3ez5Ci2ve1HTSr5iNZvhcD4L0CfDFKBqC1cpmON2F7WvOrktxOrbAjdMB6e1_GjOPeacPkThc5kwcMZoUt74KY-A0_JSNdGZgKPQinGhPE7KtoAHHfVqi6G44aHLehNOmq67P6ANgQixRnswHD9kF7JTLo16pV8pECMRhxE1XcvqbkHW1d7qXxYkLTWtqmnSqapvPOgLVu7n2X2xh8H4tchebUowXtadgKGkAWZGDmwJLRYe4TGgWA",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBn6xLOLX-0q0zupAO-riqTh7utSlMcBRud0ixjh5hUJ2iQDMoNgvlg0MSjejzg704H-lxc9t0icvKUGq7IZG4LaI4DAR8S3UibwufcOloB6vNLt_xFuIzLtQ6qdCAgWFJWHjIWX-3Bgmz6vgwivyx1IoG0R6-Oa2G3k8rGvHoaG0faJ7RkQ97XUyEG9bCCVI_Z802qTAOT7QinuuKb38kS6UmErpkgTOiHshg_30O4cc5Ww1DS0pmQSA",
            "media/videos/Mecha_Soul/",
            "4K HDR",
            "TrueHD Atmos",
            22.4,
            "Downloaded (4K HDR)",
            1
        ),
        (
            "neo-shadows",
            "Neo Shadows: Sector 9",
            "残影のネオ",
            "Neo Shadows",
            "Two psychic agents on a misty elevated rooftop walkway face holographic dragons and psycho-active surveillance clouds hovering over the metropolis.",
            2025,
            8.7,
            1590,
            13,
            "Completed",
            "Mappa Dark",
            "Psychological,Mystery,Cyberpunk",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAq_mGIYfXwAYHr2VmTuKddhGKvN-Qqxlko_7zIYTsutiX_n8pm7t53b1NEYjcGxCKr2Nv_BRSL6XbQLxdkI8jhzOgYFmu8u_DwzF7hCOofObvNwZg1zwigLah8n6h5OYrOi5FieWOKSeiQ59lKgluLjYSFP2t_VyBRPqG5EZ1sHyc_dIwTwoN5S5usL0tVJj7BasLOzs1SwP2ahDhv0Ot9urflZKSmjNaI3RsPY-9Z4NA6gt7R8Xu-FQ",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAq_mGIYfXwAYHr2VmTuKddhGKvN-Qqxlko_7zIYTsutiX_n8pm7t53b1NEYjcGxCKr2Nv_BRSL6XbQLxdkI8jhzOgYFmu8u_DwzF7hCOofObvNwZg1zwigLah8n6h5OYrOi5FieWOKSeiQ59lKgluLjYSFP2t_VyBRPqG5EZ1sHyc_dIwTwoN5S5usL0tVJj7BasLOzs1SwP2ahDhv0Ot9urflZKSmjNaI3RsPY-9Z4NA6gt7R8Xu-FQ",
            "media/videos/Neo_Shadows/",
            "1080p FHD",
            "FLAC 2.0",
            9.1,
            "Downloaded (1080p)",
            0
        ),
        (
            "ghost-protocol",
            "Ghost Protocol: Zero",
            "亡霊プロトコル",
            "Ghost Protocol",
            "A rogue cybernetic hacker infiltrates a sealed corporate core to download the zero-day virus before the mainframe wipes human sub-consciousness.",
            2026,
            9.0,
            2100,
            24,
            "Completed",
            "Kinema Nexus",
            "Cyberpunk,Thriller,Action",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDc50rdtptQxL5ykWG4YPci4jIRqKUTMWZ92rDMYVvSn3BUsxhw-mM0jaZn8944qNkynxb8I2R103rsVe_Hvsw9R3WjwuJaK7SeAI4F2WqIHNbhr-c6G6XuLODJXcjL5kDCsQ0uQw_qDhResv6fxk_RrCdX6_7M8COMfYu4ysgThC6qusRD1vVYHJjfwnXC8Hrib7xvnQgIXZnZpG9-zmFrsODH4M6zaM-81BX6vClOV2Y-tw8TQzKSiw",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCHwmlLEIuvjVlCujxe2cXzy07bIt14Dh_xdWmxfy9VEDLE5ClZvRo1wx6UH5eq_bi9JFnJQ7RI5Tgakdvz40LDTsmqySUh5s2mTSnGBis19rv58Lb8wXLlpciRY47sLNCZJ2Kd-Vcg7LIAx5MFEN5t-1RUGG74IlhVMRQmkRG6n8r-2tB1sdIbp9o4jkNd4MqYBluZphBzFAJ1oxUcL7nlhH24kFHtGJgh5h4MloW9eB6i_DBUmVnHnA",
            "media/videos/Ghost_Protocol/",
            "1080p FHD",
            "AAC 5.1",
            12.5,
            "Downloaded (1080p)",
            1
        )
    ]

    cursor.executemany("""
    INSERT OR REPLACE INTO anime (
        id, title, japanese_title, romaji_title, synopsis, year, rating, rating_count,
        episodes_count, status, studio, genres, poster_url, banner_url, storage_path,
        quality, audio_type, size_gb, download_status, is_favorite
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, anime_list)

    # Seed Episodes for Neo Ronin
    episodes_list = [
        (
            "neo-ronin-ep01", "neo-ronin", 1,
            "Awakening in the Neon Drizzle",
            "Ren wakes inside an abandoned cryogenic tank beneath Sector 9.",
            1455, 1455, 1, "downloaded", 420.0,
            "/media/videos/Neo_Ronin/Ep01.mp4",
            "/media/subtitles/neo_ronin_ep04_en.vtt",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA_lkoGJ0gyhp_zA3THJEP7V_UVEDIwyPwFJ1Cz-mqBQ8vfjv7HoMMsxreZnIdI0uTB7r_RTc4SJktv_ol_OSc0zUzuuK5upyNQFz7njrgXqKSONwwAVcDqVtzLCdpUqV_Qn0HKXMj9YM42ugGhaRy5MugEfKPSQQDqIqDMFuMSYpqOTKO_ycX2JOZfkbaUl6wYFcTZ6TJ7ft8ZdjPTI2SZhb0kIX_jZN633_Xb-TeWsnISQM2ZsVm1BA"
        ),
        (
            "neo-ronin-ep02", "neo-ronin", 2,
            "Protocol 99: Ghost Blade",
            "Corporate hunters deploy stealth combat drones into the rain channels.",
            1428, 1428, 1, "downloaded", 415.0,
            "/media/videos/Neo_Ronin/Ep02.mp4",
            "/media/subtitles/neo_ronin_ep04_en.vtt",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAWMQIN6BIhsKPcQZFnSvuOzrOJF7-4SqnKF16BtB49rBPKyuh7mtlp2bYSFQ5Gi-Fa7CW6GR0ZXUW-cQ66zgdSOAzrtvRbUQCGGwYT6LlwomWfRMYPPPg1gKr8M3kH-ul9MOtw_88DO-Bcoth_3cDl2FyyTtcA4ZnmEvJxgPjjytzl3wjG21kg9CBRX6vLFWog7epHHQcM76LXUcvCmuvwysHtOOMSc68M7YAlGHi-FGcz_7HWPMAs5Q"
        ),
        (
            "neo-ronin-ep03", "neo-ronin", 3,
            "Underground Syndicate",
            "An uneasy alliance is struck inside the lower cyber bazaar.",
            1442, 1442, 1, "downloaded", 430.0,
            "/media/videos/Neo_Ronin/Ep03.mp4",
            "/media/subtitles/neo_ronin_ep04_en.vtt",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC15ji_hGTqIrdXDnJPempN5IGmQP5Dz9xP4L39IEwms6qt230cOyu2YZ20eLLeftBUQ5Uye86tWMMrce4oDyKrEKyebDcnOdKozw0lQaX-RndN8IWP-DGUEKVYO7-1xKTMwFV8bQq9RfB50CZCHEsp9k4mM4J8COR3tB3iZbhgGa2Wf0exxNpg9y49NLYkt61ECSvF0ZJ41ANm8eZrPlmp9SWknLRo2Gr_eHhy7_-o2UplxvS3S7vlhQ"
        ),
        (
            "neo-ronin-ep04", "neo-ronin", 4,
            "Neon Rain & Broken Circuits",
            "10 min remaining • Local FLAC • Broken circuits spark in Sector 9.",
            1440, 868, 0, "downloaded", 422.0,
            "/media/videos/Neo_Ronin/Ep04.mp4",
            "/media/subtitles/neo_ronin_ep04_en.vtt",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCvjWSn3MMyaOmHYEXuqvkjLA3CldKanPAUzp0MhxAQ4razLBacmwLsrGmzB4VQOcqVbOWGb9iSlh1ykjS9b5Bva1zgeomL11u06W5n4kFcIVpSxgsY_4Cc4Z35wZKXvBwVwgKXnyjPqn678vdgqSHMbAQ6nSeHniOze2gMyklqdQ9-dfBsYs7N7vQcmGNUbYxlpQXPoYgSNVxK_OWXFbFbVfwP2q3rsQveCS6_hk7vqhs3fAph07nNJg"
        ),
        (
            "neo-ronin-ep05", "neo-ronin", 5,
            "The Android's Lament",
            "Sensory feedback loops cause severe neural glitches in Ren's cyberware.",
            1410, 0, 0, "downloading", 410.0,
            "/media/videos/Neo_Ronin/Ep05.mp4",
            "/media/subtitles/neo_ronin_ep04_en.vtt",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAIJgDuPtfProQsfV5HSaYXkzrv7OP-mIBB1PrLzPM-x8b7Rfs_uEPcUTvd_HcV6VdzFzX82wMEWGdzFdZq6cNRI1BnhG-No3kQ8WmpzdEZf7awPGfU3arB4gYnHaZkM_3pB79DootHa6cRvl3UdTLQ6GHUEHPM9Q2DEx2Tx1sqPE4Z4fzcvDZm3xlKiGqDYMh03tUgekTK1pthmqqWm2BfWET61g3SkEi7_oBEwihUs-Fs2cwU3Z8vqw"
        ),
        (
            "neo-ronin-ep06", "neo-ronin", 6,
            "Terminal Velocity",
            "High speed motorcycle chase across the elevated Mega-Highway.",
            1450, 0, 0, "ready", 435.0,
            "/media/videos/Neo_Ronin/Ep06.mp4",
            "/media/subtitles/neo_ronin_ep04_en.vtt",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCKyYTz7Q8NsTDUJRshYkCzwGWZalhNpyMIoGqp_oEbHst0WujxXmcLgw8xZeQ-JyhIs9Gh2gRY8nntsScsvvRtl0ro1hXFQxUHKBmEd_fjLt8hgnaAnbcDbLwjzyNsj-simdxJNa-PGB5pLYnGt3xPtnNAplJZntqCFLYr7xEVhiHAORr9pO9RIPMSVzFvDq1DT7_f5jE9YWpp1AsS4pXvFPYFlg_oigKc0kh4VLQmDl6xq6j0rgKJWA"
        )
    ]

    cursor.executemany("""
    INSERT OR REPLACE INTO episodes (
        id, anime_id, episode_number, title, synopsis, duration, progress_seconds,
        is_completed, download_status, file_size_mb, video_path, subtitle_path, thumbnail_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, episodes_list)

    # Seed Watch Progress (Ep 04 at 14:28 = 868 seconds)
    cursor.execute("""
    INSERT OR REPLACE INTO watch_progress (episode_id, anime_id, progress_seconds, duration_seconds, updated_at)
    VALUES ('neo-ronin-ep04', 'neo-ronin', 868, 1440, CURRENT_TIMESTAMP)
    """)

    # Seed Vault Downloads matching Image 10.png
    vault_items = [
        (
            "vault-01", "neo-ronin", "neo-ronin-ep04",
            "Neo Ronin: Cyber Attack - Episode 04",
            "NeoRonin_Ep04_1080p_HEVC.mp4",
            422.0, 422.0, "completed", 0.0, "1080p HEVC AAC",
            "media/videos/Neo_Ronin/Ep04.mp4", 1
        ),
        (
            "vault-02", "neo-ronin", "neo-ronin-ep05",
            "Neo Ronin: Cyber Attack - Episode 05",
            "NeoRonin_Ep05_1080p_HEVC.mp4",
            410.0, 320.0, "downloading", 12.4, "1080p HEVC AAC",
            "media/videos/Neo_Ronin/Ep05.mp4", 0
        ),
        (
            "vault-03", "cyber-valkyrie", "cyber-valkyrie-ep01",
            "Cyber Valkyrie - Episode 01",
            "CyberValkyrie_Ep01_DualAudio.mkv",
            512.0, 512.0, "completed", 0.0, "1080p Dual-Audio WebVTT",
            "media/videos/Cyber_Valkyrie/Ep01.mkv", 1
        ),
        (
            "vault-04", "ghost-protocol", "ghost-protocol-ep12",
            "Ghost Protocol - Episode 12 (Season Finale)",
            "GhostProtocol_Ep12_1080p.mp4",
            480.0, 480.0, "completed", 0.0, "1080p FHD",
            "media/videos/Ghost_Protocol/Ep12.mp4", 1
        )
    ]

    cursor.executemany("""
    INSERT OR REPLACE INTO vault_downloads (
        id, anime_id, episode_id, title, file_name, file_size_mb, downloaded_bytes,
        status, transfer_speed_mbps, quality, storage_location, checksum_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, vault_items)

    conn.commit()
    conn.close()
    print("AnimeHub database seeded with 5 shows, 6 episodes, progress, and 4 vault items.")

if __name__ == '__main__':
    init_db()
