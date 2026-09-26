import React, { useState, useEffect } from 'react';
import { DaemonInfo } from '../types/anime';

interface DaemonLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DaemonLogsModal: React.FC<DaemonLogsModalProps> = ({ isOpen, onClose }) => {
  const [daemon, setDaemon] = useState<DaemonInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/daemon/status')
        .then((r) => r.json())
        .then((data) => setDaemon(data))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#181b24] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6ff2ff] text-[22px]">dns</span>
            <h2 className="font-['Space_Grotesk'] text-[16px] font-bold text-white">
              AnimeHub Daemon 2.4 Telemetry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#272a33] text-[#8B95B2] hover:text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 font-mono text-[11px]">
          <div className="p-2.5 rounded-lg bg-[#0b0e16] border border-white/[0.04]">
            <span className="text-[#8B95B2] block text-[9px] uppercase">Engine</span>
            <span className="text-[#6ff2ff] font-bold">{daemon?.engine || 'Python 3.10 / Flask 3.0'}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0b0e16] border border-white/[0.04]">
            <span className="text-[#8B95B2] block text-[9px] uppercase">Database</span>
            <span className="text-[#ff4e7b] font-bold">{daemon?.database || 'SQLite 3.42 (WAL Mode)'}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0b0e16] border border-white/[0.04]">
            <span className="text-[#8B95B2] block text-[9px] uppercase">Hardware Acceleration</span>
            <span className="text-white font-bold">{daemon?.hardware_decoding || 'NVDEC / VAAPI'}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0b0e16] border border-white/[0.04]">
            <span className="text-[#8B95B2] block text-[9px] uppercase">Stream Protocol</span>
            <span className="text-[#6ff2ff] font-bold">{daemon?.stream_protocol || 'HTTP 206 Partial Content'}</span>
          </div>
        </div>

        <div className="bg-[#0b0e16] p-3 rounded-lg border border-white/[0.06] font-mono text-[10px] text-[#8B95B2] max-h-40 overflow-y-auto leading-relaxed">
          <div className="text-[#6ff2ff] font-bold mb-1">=== DAEMON EVENT LOG BUFFER ===</div>
          <p>[INFO] Daemon initialized on 127.0.0.1:5000</p>
          <p>[INFO] SQLite connection pool primed: anime_vault.db (WAL mode active)</p>
          <p>[STREAM] Video worker mapped: media/videos/Neo_Ronin/Ep04.mp4 (206 Range OK)</p>
          <p>[SUBS] Subtitle tracks registered: .vtt (EN, JA, TA, ES)</p>
          <p>[SYNC] Watch progress checkpoint thread running (every 5000ms)</p>
          <p className="text-emerald-400">[READY] Vault node active. All offline media verified.</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#ff4e7b] text-white font-['Space_Grotesk'] text-[12px] font-bold shadow-[0_0_10px_rgba(255,78,123,0.4)]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
