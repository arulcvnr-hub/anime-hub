import React, { useState, useEffect } from 'react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('backend/app.py');
  const [codeContent, setCodeContent] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/architecture')
        .then((res) => res.json())
        .then((data) => {
          if (data.files) {
            setCodeContent(data.files);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = codeContent[selectedFile] || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#10131b] border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#181b24] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ff4e7b] text-[24px]">account_tree</span>
            <div>
              <h2 className="font-['Space_Grotesk'] text-[16px] font-bold text-white flex items-center gap-2">
                Project Architecture &amp; File Tree
                <span className="px-2 py-0.2 rounded-full bg-[#6ff2ff]/15 text-[#6ff2ff] text-[10px] font-mono">
                  Python + Flask + SQLite
                </span>
              </h2>
              <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
                Full breakdown of Frontend, Backend, Database, and Media layers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#272a33] text-[#8B95B2] hover:text-white flex items-center justify-center border border-white/10"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {/* Left Column: Interactive Tree */}
          <div className="p-4 flex flex-col gap-3 bg-[#0b0e16]/60 font-mono text-[12px]">
            <div className="text-[#6ff2ff] font-bold flex items-center gap-1.5 pb-1 border-b border-white/[0.06]">
              <span className="material-symbols-outlined text-[18px]">folder_special</span>
              <span>Anime App Architecture</span>
            </div>

            <div className="flex flex-col gap-1 leading-relaxed text-[#e0e2ee]">
              {/* Root */}
              <div className="font-bold text-[#ffb2bd]">Anime App</div>
              <div className="pl-3 border-l border-white/10 flex flex-col gap-2">
                {/* Frontend */}
                <div>
                  <div className="text-[#6ff2ff] font-semibold">├── Frontend</div>
                  <div className="pl-4 text-[#8B95B2] flex flex-col gap-0.5 text-[11px]">
                    <div>├── HTML (index.html)</div>
                    <div>├── CSS (Tailwind v4 Cyberpunk)</div>
                    <div>└── JavaScript / React (src/*)</div>
                  </div>
                </div>

                {/* Backend */}
                <div>
                  <div className="text-[#ff4e7b] font-semibold">├── Backend</div>
                  <div className="pl-4 text-[#8B95B2] flex flex-col gap-0.5 text-[11px]">
                    <button
                      onClick={() => setSelectedFile('backend/app.py')}
                      className={`text-left hover:text-[#6ff2ff] transition-colors ${
                        selectedFile === 'backend/app.py' ? 'text-[#6ff2ff] font-bold' : ''
                      }`}
                    >
                      ├── Python + Flask (app.py)
                    </button>
                    <button
                      onClick={() => setSelectedFile('backend/init_db.py')}
                      className={`text-left hover:text-[#6ff2ff] transition-colors ${
                        selectedFile === 'backend/init_db.py' ? 'text-[#6ff2ff] font-bold' : ''
                      }`}
                    >
                      └── Database Seeder (init_db.py)
                    </button>
                  </div>
                </div>

                {/* Database */}
                <div>
                  <div className="text-[#e0b6ff] font-semibold">├── Database</div>
                  <div className="pl-4 text-[#8B95B2] flex flex-col gap-0.5 text-[11px]">
                    <button
                      onClick={() => setSelectedFile('database/schema.sql')}
                      className={`text-left hover:text-[#e0b6ff] transition-colors ${
                        selectedFile === 'database/schema.sql' ? 'text-[#e0b6ff] font-bold' : ''
                      }`}
                    >
                      ├── SQLite (anime_vault.db)
                    </button>
                    <button
                      onClick={() => setSelectedFile('database/schema.sql')}
                      className={`text-left hover:text-[#e0b6ff] transition-colors ${
                        selectedFile === 'database/schema.sql' ? 'text-[#e0b6ff] font-bold' : ''
                      }`}
                    >
                      └── Schema (schema.sql)
                    </button>
                  </div>
                </div>

                {/* Local Media */}
                <div>
                  <div className="text-emerald-400 font-semibold">└── Local Media</div>
                  <div className="pl-4 text-[#8B95B2] flex flex-col gap-0.5 text-[11px]">
                    <div>├── Anime Images (Posters &amp; Visuals)</div>
                    <div>├── Videos (Neo_Ronin/Ep04.mp4)</div>
                    <button
                      onClick={() => setSelectedFile('media/subtitles/neo_ronin_ep04_en.vtt')}
                      className={`text-left hover:text-emerald-300 transition-colors ${
                        selectedFile === 'media/subtitles/neo_ronin_ep04_en.vtt' ? 'text-emerald-400 font-bold' : ''
                      }`}
                    >
                      └── Subtitles (neo_ronin_ep04_en.vtt)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded bg-[#181b24] border border-white/[0.04] text-[10px] text-[#8B95B2]">
              <span className="text-[#6ff2ff] font-bold block mb-1">Local Daemon Features:</span>
              • HTTP 206 Byte-Range Video Streaming<br />
              • SQLite 3.42 WAL Mode Lossless Resume<br />
              • WebVTT Subtitle Multi-language Tracks<br />
              • Real-time Watch Progress Synchronization
            </div>
          </div>

          {/* Right Column: Code Viewer */}
          <div className="col-span-2 flex flex-col h-full bg-[#0b0e16] overflow-hidden">
            {/* Code Header */}
            <div className="px-4 py-2.5 bg-[#181b24] border-b border-white/[0.06] flex items-center justify-between">
              <span className="font-mono text-[12px] text-[#6ff2ff] font-bold">
                {selectedFile}
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-[#272a33] hover:bg-[#32353e] text-white font-['Space_Grotesk'] text-[11px] font-bold border border-white/10 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Code Content */}
            <pre className="flex-1 p-4 font-mono text-[11px] text-[#e0e2ee] overflow-auto leading-relaxed scrollbar-none selection:bg-[#ff4e7b] selection:text-white">
              {codeContent[selectedFile] || '// Loading file content...'}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#181b24] border-t border-white/[0.08] flex items-center justify-between">
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
            AnimeHub Offline Vault • Production Architecture
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#ff4e7b] text-white font-['Space_Grotesk'] text-[12px] font-bold shadow-[0_0_10px_rgba(255,78,123,0.4)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
