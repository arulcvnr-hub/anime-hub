import React from 'react';

interface BottomNavProps {
  currentTab: 'home' | 'library' | 'player' | 'downloads' | 'vault';
  onSelectTab: (tab: 'home' | 'library' | 'player' | 'downloads' | 'vault') => void;
  downloadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  downloadCount = 4,
}) => {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#0b0e16]/90 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] w-14 h-14 transition-all ${
            currentTab === 'home'
              ? 'text-[#6ff2ff] drop-shadow-[0_0_12px_rgba(111,242,255,0.7)]'
              : 'text-[#8B95B2] hover:text-[#e0e2ee]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="font-['Space_Grotesk'] text-[10px] font-bold mt-0.5">Home</span>
        </button>

        {/* Library */}
        <button
          onClick={() => onSelectTab('library')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] w-14 h-14 transition-all ${
            currentTab === 'library'
              ? 'text-[#6ff2ff] drop-shadow-[0_0_12px_rgba(111,242,255,0.7)]'
              : 'text-[#8B95B2] hover:text-[#e0e2ee]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">video_library</span>
          <span className="font-['Space_Grotesk'] text-[10px] font-bold mt-0.5">Library</span>
        </button>

        {/* Player (Prominent Floating Button) */}
        <button
          onClick={() => onSelectTab('player')}
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] w-14 h-14 transition-all group"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              currentTab === 'player'
                ? 'bg-[#ff4e7b] text-white shadow-[0_0_20px_rgba(255,78,123,0.7)] scale-105'
                : 'bg-[#272a33] text-[#ffb2bd] group-hover:scale-105 group-hover:text-white shadow-[0_0_12px_rgba(255,78,123,0.3)]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
          </div>
          <span
            className={`font-['Space_Grotesk'] text-[10px] font-bold mt-0.5 ${
              currentTab === 'player' ? 'text-[#ff4e7b]' : 'text-[#8B95B2]'
            }`}
          >
            Player
          </span>
        </button>

        {/* Downloads */}
        <button
          onClick={() => onSelectTab('downloads')}
          className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] w-14 h-14 transition-all ${
            currentTab === 'downloads'
              ? 'text-[#6ff2ff] drop-shadow-[0_0_12px_rgba(111,242,255,0.7)]'
              : 'text-[#8B95B2] hover:text-[#e0e2ee]'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">download</span>
            {downloadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-[#ff4e7b] text-white font-['Space_Grotesk'] text-[9px] leading-tight font-bold shadow-[0_0_8px_rgba(255,78,123,0.7)]">
                {downloadCount}
              </span>
            )}
          </div>
          <span className="font-['Space_Grotesk'] text-[10px] font-bold mt-0.5">Downloads</span>
        </button>

        {/* Vault */}
        <button
          onClick={() => onSelectTab('vault')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] w-14 h-14 transition-all ${
            currentTab === 'vault'
              ? 'text-[#6ff2ff] drop-shadow-[0_0_12px_rgba(111,242,255,0.7)]'
              : 'text-[#8B95B2] hover:text-[#e0e2ee]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">shield_lock</span>
          <span className="font-['Space_Grotesk'] text-[10px] font-bold mt-0.5">Vault</span>
        </button>
      </div>
    </nav>
  );
};
