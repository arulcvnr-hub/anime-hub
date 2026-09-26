import React from 'react';

interface HeaderProps {
  currentTab: 'home' | 'library' | 'player' | 'downloads' | 'vault';
  activeShowTitle?: string;
  onBack?: () => void;
  canGoBack?: boolean;
  onOpenArchitecture?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeShowTitle,
  onBack,
  canGoBack,
  onOpenArchitecture,
}) => {
  const getSubtext = () => {
    switch (currentTab) {
      case 'home':
        return 'LIBRARY OVERVIEW';
      case 'library':
        return 'ANIME ARCHIVE';
      case 'player':
        return activeShowTitle ? 'FULLSCREEN VIDEO' : 'MEDIA PLAYER';
      case 'downloads':
        return 'DOWNLOAD QUEUE';
      case 'vault':
        return 'VAULT ADMIN';
      default:
        return 'LOCAL NODE';
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#10131b]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Branding / Back */}
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={onBack}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#e0e2ee] rounded-full hover:bg-white/10 active:scale-95 transition-all"
              title="Go back"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#181b24] border border-[#ff4e7b]/30 shadow-[0_0_12px_rgba(255,78,123,0.35)]">
              <span className="material-symbols-outlined text-[#ff4e7b] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#6ff2ff] shadow-[0_0_6px_#6ff2ff]"></span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-['Space_Grotesk'] text-[18px] font-bold text-[#e0e2ee] tracking-tight">
                  Anime<span className="text-[#ff4e7b]">Hub</span>
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#6ff2ff]/15 text-[#6ff2ff] rounded">
                  VAULT
                </span>
              </div>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#ffb2bd] tracking-widest uppercase font-semibold mt-0.5">
                {getSubtext()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-2.5">
          {/* Architecture Code Explorer Toggle */}
          {onOpenArchitecture && (
            <button
              onClick={onOpenArchitecture}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#181b24] border border-white/10 hover:border-[#6ff2ff]/40 text-[#e0e2ee] text-[11px] font-mono hover:text-[#6ff2ff] transition-all"
              title="Inspect Full App Architecture (Python, SQLite, WebVTT)"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ff4e7b]">account_tree</span>
              <span className="hidden sm:inline">Code Tree</span>
            </button>
          )}

          {/* Localhost / SQLite Node Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#272a33]/80 border border-[#6ff2ff]/25 backdrop-blur-md shadow-[0_0_12px_rgba(5,217,232,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#6ff2ff] animate-pulse shadow-[0_0_8px_#6ff2ff]"></span>
            <span className="font-['Space_Grotesk'] text-[10px] sm:text-[11px] text-[#6ff2ff] tracking-wider font-bold">
              LOCALHOST:5000
            </span>
          </div>

          {/* Profile Avatar */}
          <div className="relative group cursor-pointer">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-[#ff4e7b]/40 shadow-[0_0_10px_rgba(255,78,123,0.35)]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA49x3SGc-qG9A1DwDERawVxqBAY-lK8P5YlZN2cgn1kQ2HaUzRc_NDX12Bc5eo7fbtMJ_J6yTwklbmS7ES-cj9WeP9sHkslmdTTXIGDWsle0y0tKIUBdhxMmukHmYIJljS6WFvbGkTyJiR13yJgKIaAnD4I1XVvmVDeoWcSOvRHBOcKC8T9rOxG92ZOJheh0v656zgJwU6mmwxkAgNex-ipVzkFnLGijZ3XO_zJRqGq7q9meVwzYYcA"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
