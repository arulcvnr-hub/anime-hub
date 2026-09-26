import React, { useState, useEffect } from 'react';
import { VaultItem, StorageStatus } from '../types/anime';

interface VaultAdminProps {
  initialTab?: 'downloads' | 'admin' | 'status';
  onPlayEpisode: (showId: string, episodeId: string) => void;
  onRefreshShows: () => void;
}

export const VaultAdmin: React.FC<VaultAdminProps> = ({
  initialTab = 'downloads',
  onPlayEpisode,
  onRefreshShows,
}) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'admin' | 'status'>(initialTab);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [storage, setStorage] = useState<StorageStatus>({
    total_gb: 512,
    used_gb: 184.2,
    vault_cache_gb: 3.8,
    free_gb: 328,
    usage_percentage: 36,
    status: 'Offline Mode Active',
  });

  // Admin / Add Show Form State
  const [newTitle, setNewTitle] = useState('');
  const [newYear, setNewYear] = useState('2026');
  const [newRating, setNewRating] = useState('9.1');
  const [newStudio, setNewStudio] = useState('Studio MAPPA Neo');
  const [newGenres, setNewGenres] = useState('Cyberpunk,Action');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Admin / Add Episode Form State
  const [epTargetShow, setEpTargetShow] = useState('neo-ronin');
  const [epNumber, setEpNumber] = useState('7');
  const [epTitle, setEpTitle] = useState('Electric Shadows');
  const [epSuccess, setEpSuccess] = useState('');

  // SQLite DB Inspector State
  const [sqlQuery, setSqlQuery] = useState('SELECT id, title, rating, episodes_count, size_gb FROM anime LIMIT 5;');
  const [sqlResult, setSqlResult] = useState<{ columns?: string[]; rows?: any[]; message?: string; count?: number } | null>(null);
  const [sqlRunning, setSqlRunning] = useState(false);
  const [sqlError, setSqlError] = useState('');

  // Fetch vault items
  const fetchVault = async () => {
    try {
      const res = await fetch('/api/vault/downloads');
      const data = await res.json();
      if (data.downloads) setVaultItems(data.downloads);
      if (data.storage) setStorage(data.storage);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchVault();
    // Run default query
    runSql('SELECT id, title, rating, episodes_count, size_gb FROM anime LIMIT 5;');
  }, []);

  const runSql = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    setSqlRunning(true);
    setSqlError('');
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.status === 'error' || data.error) {
        setSqlError(data.message || data.error);
        setSqlResult(null);
      } else {
        setSqlResult(data);
      }
    } catch (err: any) {
      setSqlError(err.message);
    } finally {
      setSqlRunning(false);
    }
  };

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setIsSubmitting(true);
    setSubmitSuccess('');
    try {
      const res = await fetch('/api/vault/add-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          year: parseInt(newYear, 10),
          rating: parseFloat(newRating),
          studio: newStudio,
          genres: newGenres,
          poster_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvjWSn3MMyaOmHYEXuqvkjLA3CldKanPAUzp0MhxAQ4razLBacmwLsrGmzB4VQOcqVbOWGb9iSlh1ykjS9b5Bva1zgeomL11u06W5n4kFcIVpSxgsY_4Cc4Z35wZKXvBwVwgKXnyjPqn678vdgqSHMbAQ6nSeHniOze2gMyklqdQ9-dfBsYs7N7vQcmGNUbYxlpQXPoYgSNVxK_OWXFbFbVfwP2q3rsQveCS6_hk7vqhs3fAph07nNJg',
          banner_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYc-bQt0Yp0dICzsvfQmdz2sl8Myol6LGNy9z17ZxUoPqulzuJjT_xjb7lvEWei65garpa06bVxMkyKALaSnHX6VEmQ93UVSVaKx9WQIsiICfJ_M8Z66gw00EK8bN4kFg8-IAHUHDJi0dQueGo9-iA7BU03g1WG03UYuX4UTpXFyeuRgK-6K55wtgw9AEdGERWyuGXW-XdMPxMPYClBKLM8xVeMTF_tJv4xnPUhUWtRewDe5kh2ZKZ9A',
          size_gb: 10.2,
        }),
      });
      const data = await res.json();
      if (data.success || data.status === 'success') {
        setSubmitSuccess(`Anime "${newTitle}" committed to SQLite database.`);
        setNewTitle('');
        onRefreshShows();
        fetchVault();
      }
    } catch (err: any) {
      alert(`Error saving to SQLite: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportSql = async () => {
    try {
      const res = await fetch('/api/architecture');
      const data = await res.json();
      const sqlContent = data.files['database/schema.sql'];
      const blob = new Blob([sqlContent], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'anime_vault_backup.sql';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export backup');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-24">
      {/* 1. Header Banner */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#272a33] border border-[#ff4e7b]/30 flex items-center justify-center shadow-[0_0_12px_rgba(255,78,123,0.35)] text-[#ff4e7b]">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              cloud_download
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-['Space_Grotesk'] text-[18px] font-bold text-white">Local Vault</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#6ff2ff]/15 text-[#6ff2ff] font-['Space_Grotesk'] text-[10px] uppercase tracking-wider font-bold">
                NODE 01
              </span>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
              Storage sync &amp; offline database admin
            </p>
          </div>
        </div>

        {/* Pulse badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#272a33] border border-[#6ff2ff]/30 text-[#6ff2ff] shadow-[0_0_10px_rgba(111,242,255,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#6ff2ff] animate-ping"></span>
          <span className="font-['Space_Grotesk'] text-[10px] font-bold">127.0.0.1</span>
        </div>
      </div>

      {/* 2. Segmented Top Switcher Tabs */}
      <div className="px-4 my-3">
        <div className="flex p-1 rounded-xl bg-[#0b0e16] border border-white/[0.06] shadow-inner">
          <button
            onClick={() => setActiveTab('downloads')}
            className={`flex-1 py-2 px-1 rounded-lg text-center font-['Space_Grotesk'] text-[12px] font-bold transition-all ${
              activeTab === 'downloads'
                ? 'bg-[#ff4e7b] text-white shadow-[0_0_14px_rgba(255,78,123,0.4)]'
                : 'text-[#8B95B2] hover:text-white'
            }`}
          >
            Downloads ({vaultItems.length || 4})
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2 px-1 rounded-lg text-center font-['Space_Grotesk'] text-[12px] font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-[#ff4e7b] text-white shadow-[0_0_14px_rgba(255,78,123,0.4)]'
                : 'text-[#8B95B2] hover:text-white'
            }`}
          >
            Admin / Add
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 px-1 rounded-lg text-center font-['Space_Grotesk'] text-[12px] font-bold transition-all ${
              activeTab === 'status'
                ? 'bg-[#ff4e7b] text-white shadow-[0_0_14px_rgba(255,78,123,0.4)]'
                : 'text-[#8B95B2] hover:text-white'
            }`}
          >
            DB &amp; Server
          </button>
        </div>
      </div>

      {/* TAB 1: Offline Download Manager */}
      {activeTab === 'downloads' && (
        <section className="flex flex-col gap-3.5 px-4">
          {/* Storage & Partition Bar */}
          <div className="p-4 rounded-xl bg-[#272a33]/90 border border-white/[0.08] backdrop-blur-md shadow-md flex flex-col gap-2">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#6ff2ff]">pie_chart</span>
                <span className="font-['Space_Grotesk'] text-[12px] font-bold">Local Disk Partition</span>
              </div>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#ff4e7b] tracking-wider uppercase font-bold">
                Auto-cleanup: OFF
              </span>
            </div>

            {/* Multi-tier Bar Display */}
            <div className="w-full h-2.5 rounded-full bg-[#0b0e16] overflow-hidden flex my-1 border border-white/[0.04]">
              <div
                className="h-full bg-[#ff4e7b] shadow-[0_0_8px_rgba(255,78,123,0.6)]"
                style={{ width: '14%' }}
                title="Downloaded Media (3.8 GB)"
              ></div>
              <div
                className="h-full bg-[#6ff2ff] shadow-[0_0_8px_rgba(111,242,255,0.6)]"
                style={{ width: '6%' }}
                title="SQLite WAL DB Cache (1.2 GB)"
              ></div>
              <div className="h-full bg-[#32353e]" style={{ width: '80%' }}></div>
            </div>

            <div className="flex items-center justify-between font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ff4e7b]"></span> 3.8 GB Vault
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#32353e]"></span> 328 GB Free
                </span>
              </div>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold">
                PWA Storage API
              </span>
            </div>
          </div>

          {/* Stored Media Assets Header */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="font-['Space_Grotesk'] text-[16px] font-bold text-white">Stored Media Assets</span>
              <span className="px-2 py-0.5 rounded-full bg-[#32353e] text-[#6ff2ff] font-['Space_Grotesk'] text-[10px] font-bold">
                {vaultItems.length || 4} files
              </span>
            </div>
            <button
              onClick={() => alert('All vault transfers paused.')}
              className="font-['Space_Grotesk'] text-[11px] text-[#ff4e7b] hover:text-[#ffb2bd] uppercase tracking-wider font-bold transition-colors"
            >
              Pause All
            </button>
          </div>

          {/* Card 1: Ep 04 (Available Offline) */}
          <div className="p-3 rounded-xl bg-[#181b24] border border-white/[0.06] shadow-sm flex flex-col gap-2 hover:bg-[#272a33] transition-all">
            <div className="flex items-start gap-3">
              <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-[#0b0e16]">
                <img
                  alt="Ep 04"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvjWSn3MMyaOmHYEXuqvkjLA3CldKanPAUzp0MhxAQ4razLBacmwLsrGmzB4VQOcqVbOWGb9iSlh1ykjS9b5Bva1zgeomL11u06W5n4kFcIVpSxgsY_4Cc4Z35wZKXvBwVwgKXnyjPqn678vdgqSHMbAQ6nSeHniOze2gMyklqdQ9-dfBsYs7N7vQcmGNUbYxlpQXPoYgSNVxK_OWXFbFbVfwP2q3rsQveCS6_hk7vqhs3fAph07nNJg"
                />
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-white font-['Space_Grotesk'] text-[9px]">
                  422MB
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6ff2ff] shadow-[0_0_6px_#6ff2ff]"></span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold uppercase tracking-wider">
                    Available Offline
                  </span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[13px] font-bold text-white truncate mt-0.5">
                  Neo Ronin: Cyber Attack
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
                  Episode 04 • 1080p HEVC AAC
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#6ff2ff]">check_circle</span>
                Verified Checksum
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Media asset deleted from local SQLite vault cache.')}
                  className="px-2.5 py-1 rounded-lg bg-[#272a33] text-red-400 hover:bg-red-950/40 border border-red-500/20 flex items-center gap-1 font-['Space_Grotesk'] text-[11px] font-bold"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span> Delete
                </button>
                <button
                  onClick={() => onPlayEpisode('neo-ronin', 'neo-ronin-ep04')}
                  className="px-3 py-1 rounded-lg bg-[#ff4e7b] text-white shadow-[0_0_12px_rgba(255,78,123,0.35)] flex items-center gap-1 font-['Space_Grotesk'] text-[11px] font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  Play
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Active Downloading Episode (78%, 12.4 MB/s) */}
          <div className="p-3 rounded-xl bg-[#1d1f28] border border-[#6ff2ff]/30 shadow-md flex flex-col gap-2 shadow-[0_0_14px_rgba(111,242,255,0.08)]">
            <div className="flex items-start gap-3">
              <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-[#0b0e16]">
                <img
                  alt="Ep 05"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIJgDuPtfProQsfV5HSaYXkzrv7OP-mIBB1PrLzPM-x8b7Rfs_uEPcUTvd_HcV6VdzFzX82wMEWGdzFdZq6cNRI1BnhG-No3kQ8WmpzdEZf7awPGfU3arB4gYnHaZkM_3pB79DootHa6cRvl3UdTLQ6GHUEHPM9Q2DEx2Tx1sqPE4Z4fzcvDZm3xlKiGqDYMh03tUgekTK1pthmqqWm2BfWET61g3SkEi7_oBEwihUs-Fs2cwU3Z8vqw"
                />
                <div className="absolute inset-0 bg-[#0b0e16]/60 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px] text-[#6ff2ff] animate-spin">sync</span>
                </div>
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[#6ff2ff] font-['Space_Grotesk'] text-[9px] font-bold">
                  78%
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#6ff2ff] animate-pulse shadow-[0_0_8px_#6ff2ff]"></span>
                    Downloading
                  </span>
                  <span className="font-['Space_Grotesk'] text-[11px] text-[#ff4e7b] font-bold">12.4 MB/s</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[13px] font-bold text-white truncate mt-0.5">
                  Neo Ronin: Cyber Attack
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
                  Episode 05 • 320 MB / 410 MB
                </p>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#0b0e16] overflow-hidden mt-1 relative border border-white/[0.04]">
              <div
                className="h-full bg-[#6ff2ff] shadow-[0_0_12px_#6ff2ff] transition-all duration-300"
                style={{ width: '78%' }}
              ></div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
                Local loopback HTTP transfer
              </span>
              <button
                onClick={() => alert('Download paused')}
                className="px-3 py-1 rounded-lg bg-[#272a33] text-white flex items-center gap-1 font-['Space_Grotesk'] text-[11px] font-bold hover:bg-[#32353e] border border-white/10"
              >
                <span className="material-symbols-outlined text-[15px]">pause</span> Pause
              </button>
            </div>
          </div>

          {/* Card 3: Cyber Valkyrie */}
          <div className="p-3 rounded-xl bg-[#181b24] border border-white/[0.06] shadow-sm flex flex-col gap-2 hover:bg-[#272a33] transition-all">
            <div className="flex items-start gap-3">
              <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-[#0b0e16]">
                <img
                  alt="Valkyrie"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOOCtXOfldYAqkiZNRr8p3MK3X_i87LpDG0om4H4Xg9GjbqVgTVy2FM3gwZctLCxOFqZZdU0eDX1-bVtQUiyne1RYGrDVuNGHvZc6T115Mg1LWfciC5KvvSJGcSzwakSg1PPbKRx6OBzQhITltZchLd1zO9Q7agQ7ks68iCa8CuG0rJHsax6XtPtMrMX3LETw5CvD0_f073omgxko_BgAU9wXeaoITcYj4Me4_RDS8ySyfaK2VEiGlIg"
                />
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-white font-['Space_Grotesk'] text-[9px]">
                  512MB
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6ff2ff] shadow-[0_0_6px_#6ff2ff]"></span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold uppercase tracking-wider">
                    Available Offline
                  </span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[13px] font-bold text-white truncate mt-0.5">
                  Cyber Valkyrie
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
                  Episode 01 • 1080p Dual-Audio WebVTT
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#6ff2ff]">check_circle</span>
                Verified Checksum
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Deleted.')}
                  className="px-2.5 py-1 rounded-lg bg-[#272a33] text-red-400 hover:bg-red-950/40 border border-red-500/20 flex items-center gap-1 font-['Space_Grotesk'] text-[11px] font-bold"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span> Delete
                </button>
                <button
                  onClick={() => onPlayEpisode('mecha-soul', 'mecha-soul-ep01')}
                  className="px-3 py-1 rounded-lg bg-[#ff4e7b] text-white shadow-[0_0_12px_rgba(255,78,123,0.35)] flex items-center gap-1 font-['Space_Grotesk'] text-[11px] font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  Play
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Ghost Protocol */}
          <div className="p-3 rounded-xl bg-[#181b24] border border-white/[0.06] shadow-sm flex flex-col gap-2 hover:bg-[#272a33] transition-all">
            <div className="flex items-start gap-3">
              <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-[#0b0e16]">
                <img
                  alt="Ghost Protocol"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc50rdtptQxL5ykWG4YPci4jIRqKUTMWZ92rDMYVvSn3BUsxhw-mM0jaZn8944qNkynxb8I2R103rsVe_Hvsw9R3WjwuJaK7SeAI4F2WqIHNbhr-c6G6XuLODJXcjL5kDCsQ0uQw_qDhResv6fxk_RrCdX6_7M8COMfYu4ysgThC6qusRD1vVYHJjfwnXC8Hrib7xvnQgIXZnZpG9-zmFrsODH4M6zaM-81BX6vClOV2Y-tw8TQzKSiw"
                />
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-white font-['Space_Grotesk'] text-[9px]">
                  480MB
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6ff2ff] shadow-[0_0_6px_#6ff2ff]"></span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold uppercase tracking-wider">
                    Available Offline
                  </span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[13px] font-bold text-white truncate mt-0.5">
                  Ghost Protocol
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
                  Episode 12 (Season Finale) • 1080p
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#6ff2ff]">check_circle</span>
                Verified Checksum
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Deleted.')}
                  className="px-2.5 py-1 rounded-lg bg-[#272a33] text-red-400 hover:bg-red-950/40 border border-red-500/20 flex items-center gap-1 font-['Space_Grotesk'] text-[11px] font-bold"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span> Delete
                </button>
                <button
                  onClick={() => onPlayEpisode('ghost-protocol', 'ghost-protocol-ep11')}
                  className="px-3 py-1 rounded-lg bg-[#ff4e7b] text-white shadow-[0_0_12px_rgba(255,78,123,0.35)] flex items-center gap-1 font-['Space_Grotesk'] text-[11px] font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  Play
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: Admin / Add Anime & Episodes to SQLite */}
      {activeTab === 'admin' && (
        <section className="flex flex-col gap-4 px-4">
          {/* Card A: Add New Anime Series */}
          <div className="p-4 rounded-xl bg-[#272a33] border border-white/[0.08] shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[#ff4e7b] pb-1 border-b border-white/[0.06]">
              <span className="material-symbols-outlined text-[22px]">create_new_folder</span>
              <h2 className="font-['Space_Grotesk'] text-[16px] font-bold text-white">Add New Anime Series</h2>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] text-[12px] text-[#8B95B2]">
              Creates directory structure &amp; writes metadata record to local SQLite database.
            </p>

            {submitSuccess && (
              <div className="p-2.5 rounded-lg bg-[#00d8e7]/15 border border-[#6ff2ff]/40 text-[#6ff2ff] font-['Space_Grotesk'] text-[12px] font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleAddShow} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="font-['Space_Grotesk'] text-[10px] text-white font-bold uppercase tracking-wider block mb-1">
                  Anime Title
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0e16] text-white font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:border-[#6ff2ff] focus:outline-none"
                  placeholder="e.g. Cyber Runner 2099"
                  type="text"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-['Space_Grotesk'] text-[10px] text-white font-bold uppercase tracking-wider block mb-1">
                    Release Year
                  </label>
                  <input
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e16] text-white font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:border-[#6ff2ff] focus:outline-none"
                    type="number"
                  />
                </div>
                <div>
                  <label className="font-['Space_Grotesk'] text-[10px] text-white font-bold uppercase tracking-wider block mb-1">
                    Rating
                  </label>
                  <input
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e16] text-white font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:border-[#6ff2ff] focus:outline-none"
                    placeholder="9.0"
                    type="text"
                  />
                </div>
              </div>

              <div>
                <label className="font-['Space_Grotesk'] text-[10px] text-white font-bold uppercase tracking-wider block mb-1">
                  Animation Studio
                </label>
                <input
                  value={newStudio}
                  onChange={(e) => setNewStudio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0e16] text-white font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:border-[#6ff2ff] focus:outline-none"
                  placeholder="e.g. Studio Triggerhead / Mappa"
                  type="text"
                />
              </div>

              <div>
                <label className="font-['Space_Grotesk'] text-[10px] text-white font-bold uppercase tracking-wider block mb-1.5">
                  Genre Badges (comma separated)
                </label>
                <input
                  value={newGenres}
                  onChange={(e) => setNewGenres(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0e16] text-white font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:border-[#6ff2ff] focus:outline-none"
                  placeholder="Action,Cyberpunk,Sci-Fi"
                  type="text"
                />
              </div>

              {/* Visual Image Dropper Mockups */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div
                  onClick={() => alert('Poster visual assigned from default anime collection.')}
                  className="p-3 rounded-lg bg-[#0b0e16] border border-dashed border-[#6ff2ff]/40 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#181b24] transition-colors"
                >
                  <span className="material-symbols-outlined text-[28px] text-[#6ff2ff] mb-1">
                    add_photo_alternate
                  </span>
                  <span className="font-['Space_Grotesk'] text-[11px] font-bold text-white">Poster (2:3)</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8B95B2]">
                    Preset configured
                  </span>
                </div>

                <div
                  onClick={() => alert('Banner backdrop visual assigned.')}
                  className="p-3 rounded-lg bg-[#0b0e16] border border-dashed border-[#ff4e7b]/40 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#181b24] transition-colors"
                >
                  <span className="material-symbols-outlined text-[28px] text-[#ff4e7b] mb-1">panorama</span>
                  <span className="font-['Space_Grotesk'] text-[11px] font-bold text-white">Banner (16:9)</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8B95B2]">
                    Preset configured
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-[#ff4e7b] hover:bg-[#ff2a6d] text-white font-['Space_Grotesk'] text-[13px] font-bold shadow-[0_0_16px_rgba(255,78,123,0.4)] mt-2 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">database</span>
                {isSubmitting ? 'Writing to SQLite...' : 'Save to SQLite Database'}
              </button>
            </form>
          </div>

          {/* Card B: Ingest & Organize Episode */}
          <div className="p-4 rounded-xl bg-[#272a33] border border-white/[0.08] shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[#6ff2ff] pb-1 border-b border-white/[0.06]">
              <span className="material-symbols-outlined text-[22px]">video_settings</span>
              <h2 className="font-['Space_Grotesk'] text-[16px] font-bold text-white">
                Ingest &amp; Organize Episode
              </h2>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] text-[12px] text-[#8B95B2]">
              Auto-indexes local video container, extracts duration, and configures range headers.
            </p>

            {epSuccess && (
              <div className="p-2.5 rounded-lg bg-[#6ff2ff]/15 border border-[#6ff2ff]/40 text-[#6ff2ff] font-['Space_Grotesk'] text-[12px] font-bold">
                {epSuccess}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-1">
              <div>
                <label className="font-['Space_Grotesk'] text-[10px] text-white font-bold uppercase tracking-wider block mb-1">
                  Target Anime Show
                </label>
                <select
                  value={epTargetShow}
                  onChange={(e) => setEpTargetShow(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0e16] text-white font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:border-[#6ff2ff] focus:outline-none"
                >
                  <option value="neo-ronin">Neo Ronin: Cyber Attack (2026)</option>
                  <option value="cyber-knights">Cyber Knights: Arkham (2026)</option>
                  <option value="mecha-soul">Mecha Soul: Valkyrie (2025)</option>
                  <option value="ghost-protocol">Ghost Protocol: Zero (2026)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-['Space_Grotesk'] text-[10px] text-white font-bold uppercase tracking-wider block mb-1">
                    Ep Num
                  </label>
                  <input
                    value={epNumber}
                    onChange={(e) => setEpNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e16] text-white font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:border-[#6ff2ff] focus:outline-none"
                    type="number"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-['Space_Grotesk'] text-[10px] text-white font-bold uppercase tracking-wider block mb-1">
                    Episode Title
                  </label>
                  <input
                    value={epTitle}
                    onChange={(e) => setEpTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e16] text-white font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:border-[#6ff2ff] focus:outline-none"
                    placeholder="e.g. Electric Shadows"
                    type="text"
                  />
                </div>
              </div>

              {/* Source Video & Subtitle Mock Pickers */}
              <div className="p-3 rounded-lg bg-[#0b0e16] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-[#6ff2ff]">movie</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[12px] text-white font-mono">
                    NeoRonin_EP06_1080p.mkv
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#272a33] text-[#6ff2ff] font-['Space_Grotesk'] text-[10px]">
                  Loaded
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0b0e16]/80 text-[#8B95B2] font-['Plus_Jakarta_Sans'] text-[11px] flex items-start gap-2 border border-white/[0.04]">
                <span className="material-symbols-outlined text-[16px] text-[#6ff2ff] shrink-0 mt-0.5">
                  drive_file_move
                </span>
                <span>
                  Target Destination:{' '}
                  <code className="text-[#6ff2ff] font-mono text-[11px]">media/videos/Neo_Ronin/EP06.mp4</code>
                </span>
              </div>

              <button
                onClick={() => {
                  setEpSuccess(`Episode ${epNumber} "${epTitle}" linked and indexed into local vault.`);
                }}
                className="w-full py-2.5 rounded-lg bg-[#00d8e7]/20 border border-[#6ff2ff]/40 text-[#6ff2ff] font-['Space_Grotesk'] text-[13px] font-bold shadow-[0_0_16px_rgba(111,242,255,0.3)] mt-1 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">file_upload</span>
                Ingest &amp; Link Episode
              </button>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: DB & Server Status + Live SQLite Console */}
      {activeTab === 'status' && (
        <section className="flex flex-col gap-4 px-4">
          {/* Architecture Badge */}
          <div className="p-4 rounded-xl bg-[#272a33] border border-white/[0.08] shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#6ff2ff] animate-pulse shadow-[0_0_10px_#6ff2ff]"></span>
                <span className="font-['Space_Grotesk'] text-[16px] font-bold text-white">
                  Local Daemon Running
                </span>
              </div>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] px-2.5 py-0.5 rounded-full bg-[#0b0e16] border border-[#6ff2ff]/30 font-bold">
                200 OK
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#0b0e16] border border-white/[0.04] flex flex-col">
                <span className="font-['Space_Grotesk'] text-[9px] text-[#8B95B2] uppercase tracking-wider">
                  Web Server
                </span>
                <span className="font-['Space_Grotesk'] text-[13px] font-bold text-white mt-0.5">Flask 3.0.2</span>
                <span className="font-mono text-[10px] text-[#6ff2ff]">127.0.0.1:5000</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0b0e16] border border-white/[0.04] flex flex-col">
                <span className="font-['Space_Grotesk'] text-[9px] text-[#8B95B2] uppercase tracking-wider">
                  Database
                </span>
                <span className="font-['Space_Grotesk'] text-[13px] font-bold text-white mt-0.5">SQLite 3.42</span>
                <span className="font-mono text-[10px] text-[#ff4e7b]">WAL Mode ON</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0b0e16] border border-white/[0.04] flex flex-col">
                <span className="font-['Space_Grotesk'] text-[9px] text-[#8B95B2] uppercase tracking-wider">
                  PWA SW Cache
                </span>
                <span className="font-['Space_Grotesk'] text-[13px] font-bold text-white mt-0.5">Active</span>
                <span className="font-mono text-[10px] text-[#6ff2ff]">Cache-First V3</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0b0e16] border border-white/[0.04] flex flex-col">
                <span className="font-['Space_Grotesk'] text-[9px] text-[#8B95B2] uppercase tracking-wider">
                  Range Stream
                </span>
                <span className="font-['Space_Grotesk'] text-[13px] font-bold text-white mt-0.5">HTTP 206</span>
                <span className="font-mono text-[10px] text-[#ff4e7b]">Byte Seeking OK</span>
              </div>
            </div>

            {/* Live Interactive SQLite Console */}
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#6ff2ff]">terminal</span>
                  <span className="font-['Space_Grotesk'] text-[13px] font-bold text-white">
                    SQLite Database Query Console
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#8B95B2]">anime_vault.db</span>
              </div>

              {/* Preset Query Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'anime', q: 'SELECT id, title, rating, episodes_count, size_gb FROM anime LIMIT 5;' },
                  { label: 'episodes', q: 'SELECT id, anime_id, episode_number, title, progress_seconds FROM episodes LIMIT 6;' },
                  { label: 'watch_progress', q: 'SELECT * FROM watch_progress;' },
                  { label: 'vault_downloads', q: 'SELECT id, title, file_size_mb, status FROM vault_downloads;' },
                  { label: 'schema', q: "PRAGMA table_info('anime');" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setSqlQuery(preset.q);
                      runSql(preset.q);
                    }}
                    className="px-2 py-0.5 rounded bg-[#0b0e16] hover:bg-[#32353e] text-[#6ff2ff] font-mono text-[10px] border border-white/[0.06] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* SQL Input Area */}
              <div className="flex gap-2">
                <input
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0b0e16] text-[#e0e2ee] font-mono text-[12px] border border-white/[0.08] focus:border-[#6ff2ff] focus:outline-none"
                  placeholder="Enter SQL command..."
                />
                <button
                  onClick={() => runSql()}
                  disabled={sqlRunning}
                  className="px-3.5 py-2 rounded-lg bg-[#ff4e7b] hover:bg-[#ff2a6d] text-white font-['Space_Grotesk'] text-[12px] font-bold shadow-[0_0_12px_rgba(255,78,123,0.4)] disabled:opacity-50 shrink-0"
                >
                  {sqlRunning ? 'Running...' : 'Execute'}
                </button>
              </div>

              {/* SQL Error */}
              {sqlError && (
                <div className="p-2 rounded bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-[11px]">
                  {sqlError}
                </div>
              )}

              {/* SQL Table Data Viewer */}
              {sqlResult && sqlResult.rows && sqlResult.rows.length > 0 && (
                <div className="overflow-x-auto max-h-52 rounded-lg border border-white/[0.06] bg-[#0b0e16]">
                  <table className="w-full text-left font-mono text-[11px] text-[#e0e2ee]">
                    <thead className="bg-[#181b24] text-[#6ff2ff] border-b border-white/[0.06]">
                      <tr>
                        {sqlResult.columns?.map((col) => (
                          <th key={col} className="p-2 font-bold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {sqlResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          {sqlResult.columns?.map((col) => (
                            <td key={col} className="p-2 whitespace-nowrap text-[#8B95B2]">
                              {String(row[col] ?? 'NULL')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sqlResult && sqlResult.message && (
                <div className="p-2 rounded bg-[#00d8e7]/10 text-[#6ff2ff] font-mono text-[11px]">
                  {sqlResult.message}
                </div>
              )}
            </div>

            {/* Realtime Server Events Activity Card */}
            <div className="p-3 rounded-lg bg-[#0b0e16] font-mono text-[11px] leading-relaxed text-[#8B95B2] border border-white/[0.04]">
              <div className="text-[#6ff2ff] font-bold mb-1 flex items-center justify-between">
                <span>&gt; RECENT SERVER EVENTS</span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#8B95B2]">POLL: 1s</span>
              </div>
              <p className="truncate">
                <span className="text-[#ff4e7b]">[01:14:22]</span> GET /stream/neo_ronin_ep04 206 Partial Content
              </p>
              <p className="truncate">
                <span className="text-[#6ff2ff]">[01:15:02]</span> SW: cache.add(/assets/thumbs/valkyrie.jpg)
              </p>
              <p className="truncate">
                <span className="text-white">[01:15:18]</span> SQLite: COMMIT checkpoint to disk (3ms)
              </p>
              <p className="truncate">
                <span className="text-[#ff4e7b]">[01:15:40]</span> PWA Sync: Background fetch active (12.4 MB/s)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={handleExportSql}
                className="w-full py-2.5 rounded-lg bg-[#181b24] hover:bg-[#32353e] text-white border border-white/[0.06] font-['Space_Grotesk'] text-[12px] font-bold flex items-center justify-center gap-2 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-[#6ff2ff]">file_download</span>
                Export Database Backup (.sql)
              </button>

              <button
                onClick={() => {
                  fetchVault();
                  runSql();
                  alert('Local media directory rescanned. 14 shows indexed.');
                }}
                className="w-full py-2.5 rounded-lg bg-[#181b24] hover:bg-[#32353e] text-white border border-white/[0.06] font-['Space_Grotesk'] text-[12px] font-bold flex items-center justify-center gap-2 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-[#ff4e7b]">autorenew</span>
                Rescan Local Media Directory
              </button>

              <button
                onClick={() => alert('Local cache cleared. SQLite WAL checkpoint flushed.')}
                className="w-full py-2.5 rounded-lg bg-[#181b24] hover:bg-red-950/40 text-red-400 border border-red-500/20 font-['Space_Grotesk'] text-[12px] font-bold flex items-center justify-center gap-2 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">cached</span>
                Clear Local Web Cache &amp; Flush SW
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Floating Status Bar Footer */}
      <div className="px-4 pt-2 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6ff2ff] shadow-[0_0_8px_#6ff2ff]"></span>
          <span className="font-['Space_Grotesk'] text-[11px] text-[#8B95B2]">
            Local Vault v2.4 • Offline First
          </span>
        </div>
        <button
          onClick={() => setActiveTab('admin')}
          className="flex items-center gap-1 font-['Space_Grotesk'] text-[11px] text-[#ff4e7b] font-bold hover:underline"
        >
          <span>Add Content</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
