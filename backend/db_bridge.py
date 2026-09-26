#!/usr/bin/env python3
"""
Bridge between Node.js Express API and SQLite database using Python sqlite3.
Allows lossless read/write operations with JSON standard output.
"""
import sys
import json
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'anime_vault.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)
        
    cmd = sys.argv[1]
    
    try:
        conn = get_db()
        
        if cmd == "get_shows":
            genre = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != "all" else None
            search = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "none" else None
            
            q = "SELECT * FROM anime WHERE 1=1"
            params = []
            if genre and genre != "all":
                q += " AND genres LIKE ?"
                params.append(f"%{genre}%")
            if search and search != "none":
                q += " AND (title LIKE ? OR japanese_title LIKE ? OR synopsis LIKE ?)"
                params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
            q += " ORDER BY rating DESC"
            
            rows = conn.execute(q, params).fetchall()
            shows = [dict(r) for r in rows]
            for s in shows:
                s['genres_list'] = s['genres'].split(',') if s.get('genres') else []
            print(json.dumps(shows))
            
        elif cmd == "get_show":
            show_id = sys.argv[2]
            show = conn.execute("SELECT * FROM anime WHERE id = ?", (show_id,)).fetchone()
            if not show:
                print(json.dumps({"error": "Not found"}))
                return
            show_dict = dict(show)
            show_dict['genres_list'] = show_dict['genres'].split(',') if show_dict.get('genres') else []
            episodes = conn.execute(
                "SELECT * FROM episodes WHERE anime_id = ? ORDER BY episode_number ASC",
                (show_id,)
            ).fetchall()
            show_dict['episodes'] = [dict(e) for e in episodes]
            print(json.dumps(show_dict))
            
        elif cmd == "get_episode":
            ep_id = sys.argv[2]
            ep = conn.execute("SELECT * FROM episodes WHERE id = ?", (ep_id,)).fetchone()
            if not ep:
                print(json.dumps({"error": "Episode not found"}))
                return
            ep_dict = dict(ep)
            prog = conn.execute("SELECT * FROM watch_progress WHERE episode_id = ?", (ep_id,)).fetchone()
            ep_dict['watch_progress'] = dict(prog) if prog else None
            print(json.dumps(ep_dict))
            
        elif cmd == "save_progress":
            ep_id = sys.argv[2]
            anime_id = sys.argv[3]
            prog_sec = int(sys.argv[4])
            dur_sec = int(sys.argv[5]) if len(sys.argv) > 5 else 1440
            is_comp = 1 if prog_sec >= (dur_sec * 0.95) else 0
            
            conn.execute("""
            INSERT OR REPLACE INTO watch_progress (episode_id, anime_id, progress_seconds, duration_seconds, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (ep_id, anime_id, prog_sec, dur_sec))
            
            conn.execute("""
            UPDATE episodes SET progress_seconds = ?, is_completed = ? WHERE id = ?
            """, (prog_sec, is_comp, ep_id))
            
            conn.commit()
            print(json.dumps({"success": True, "progress_seconds": prog_sec, "is_completed": bool(is_comp)}))
            
        elif cmd == "get_vault":
            items = conn.execute("SELECT * FROM vault_downloads ORDER BY created_at DESC").fetchall()
            print(json.dumps([dict(i) for i in items]))
            
        elif cmd == "run_sql":
            sql = sys.argv[2]
            cursor = conn.cursor()
            cursor.execute(sql)
            if sql.strip().upper().startswith("SELECT") or sql.strip().upper().startswith("PRAGMA"):
                cols = [d[0] for d in cursor.description] if cursor.description else []
                rows = [dict(zip(cols, r)) for r in cursor.fetchall()]
                print(json.dumps({"columns": cols, "rows": rows, "count": len(rows)}))
            else:
                conn.commit()
                print(json.dumps({"success": True, "changes": conn.total_changes}))
                
        elif cmd == "toggle_favorite":
            show_id = sys.argv[2]
            row = conn.execute("SELECT is_favorite FROM anime WHERE id = ?", (show_id,)).fetchone()
            if row:
                new_fav = 0 if row[0] else 1
                conn.execute("UPDATE anime SET is_favorite = ? WHERE id = ?", (new_fav, show_id))
                conn.commit()
                print(json.dumps({"success": True, "is_favorite": bool(new_fav)}))
            else:
                print(json.dumps({"error": "Show not found"}))
                
        elif cmd == "add_show":
            data = json.loads(sys.argv[2])
            show_id = data.get('id') or data.get('title').lower().replace(' ', '-')
            conn.execute("""
            INSERT OR REPLACE INTO anime (
                id, title, japanese_title, romaji_title, synopsis, year, rating,
                rating_count, episodes_count, status, studio, genres, poster_url,
                banner_url, storage_path, quality, audio_type, size_gb, download_status, is_favorite
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                show_id, data.get('title'), data.get('japanese_title', ''),
                data.get('romaji_title', ''), data.get('synopsis', ''),
                data.get('year', 2026), data.get('rating', 9.0), 10,
                data.get('episodes_count', 12), data.get('status', 'Completed'),
                data.get('studio', 'Independent'), data.get('genres', 'Action,Cyberpunk'),
                data.get('poster_url', ''), data.get('banner_url', ''),
                f"media/videos/{show_id}/", data.get('quality', '1080p FHD'),
                data.get('audio_type', 'FLAC 2.0'), data.get('size_gb', 8.5),
                'Downloaded (1080p)', 0
            ))
            conn.commit()
            print(json.dumps({"success": True, "id": show_id}))
            
        else:
            print(json.dumps({"error": f"Unknown command: {cmd}"}))
            
        conn.close()
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    main()
