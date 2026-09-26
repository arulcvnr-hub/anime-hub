"""
Database management module for AnimeHub Offline Vault
SQLite engine with WAL mode and thread-safe connections.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'anime_vault.db')

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for high performance concurrent offline reading
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def execute_query(query, params=()):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    return cursor

def fetch_all(query, params=()):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [dict(ix) for ix in rows]

def fetch_one(query, params=()):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    row = cursor.fetchone()
    return dict(row) if row else None
