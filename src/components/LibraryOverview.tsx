import React, { useState } from 'react';
import { AnimeShow } from '../types/anime';

interface LibraryOverviewProps {
  shows: AnimeShow[];
  onSelectShow: (show: AnimeShow) => void;
  onResumeEpisode: (showId: string, episodeId: string) => void;
  onNavigateToVault: () => void;
  onShowDaemonLogs: () => void;
}

export const LibraryOverview: React.FC<LibraryOverviewProps> = ({
  shows,
  onSelectShow,
  onResumeEpisode,
  onNavigateToVault,
  onShowDaemonLogs,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const genres = ['All (14)', 'Cyberpunk', 'Action', 'Sci-Fi', 'Mecha', 'Psychological', 'Fantasy', 'Isekai'];

  // Filter shows based on genre and search
  const filteredShows = shows.filter((s) => {
    const matchesGenre =
      selectedGenre === 'All' ||
      selectedGenre.startsWith('All') ||
      s.genres.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.japanese_title && s.japanese_title.includes(searchQuery)) ||
      s.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const featuredShow = shows.find((s) => s.id === 'neo-ronin') || shows[0];

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-24">
      {/* 1. Local Server & Storage Status Strip */}
      <section className="px-4 py-2.5">
        <div className="bg-[#272a33]/90 backdrop-blur-md rounded-xl p-3.5 border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6ff2ff] animate-pulse shadow-[0_0_8px_#6ff2ff]"></span>
              <span className="font-['Space_Grotesk'] text-[11px] font-bold text-[#6ff2ff] uppercase tracking-wider truncate">
                Offline Mode Active
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-[#32353e]">
              <span className="material-symbols-outlined text-[13px] text-[#6ff2ff]">wifi_off</span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#e0e2ee]/80 font-mono">
                0ms (127.0.0.1:5000)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[#8B95B2] font-['Space_Grotesk'] text-[11px] mb-1.5">
            <span className="text-[#e0e2ee] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#ff4e7b]">hard_drive_2</span>
              Local Storage
            </span>
            <span className="font-mono text-[#6ff2ff]">
              184.2 GB / 512 GB <span className="text-[#8B95B2]">(36% used)</span>
            </span>
          </div>

          {/* Storage Bar with Cyberpunk Gradient */}
          <div className="w-full bg-[#0b0e16] h-2 rounded-full overflow-hidden p-[1px] border border-white/[0.04]">
            <div
              className="h-full bg-gradient-to-r from-[#6ff2ff] via-[#ff4e7b] to-[#ffb2bd] rounded-full shadow-[0_0_10px_rgba(111,242,255,0.4)]"
              style={{ width: '36%' }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-1">
            <span className="font-['Plus_Jakarta_Sans'] text-[12px] text-[#8B95B2] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4e7b] shadow-[0_0_6px_#ff4e7b]"></span>
              14 Anime Series Cached locally
            </span>
            <button
              onClick={onNavigateToVault}
              className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] hover:text-[#ff4e7b] font-bold transition-colors flex items-center gap-0.5"
            >
              Manage Vault
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Cyberpunk Hero Section */}
      {featuredShow && (
        <section className="relative px-4 pt-1 pb-4">
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.7)] group">
            {/* Background Image with Scrim */}
            <div className="relative w-full h-[380px] sm:h-[440px] bg-[#0b0e16] overflow-hidden">
              <img
                alt={featuredShow.title}
                className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700 filter contrast-105"
                src={featuredShow.banner_url || featuredShow.poster_url}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10131b] via-[#10131b]/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#10131b]/90 via-[#10131b]/35 to-transparent"></div>
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#ff4e7b]/20 blur-3xl pointer-events-none"></div>
            </div>

            {/* Hero Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {featuredShow.japanese_title && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#32353e]/80 backdrop-blur-md font-['Space_Grotesk'] text-[10px] text-[#ff4e7b] font-bold tracking-widest uppercase border border-[#ff4e7b]/30 shadow-[0_0_12px_rgba(255,78,123,0.3)]">
                    {featuredShow.japanese_title}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-[#00d8e7]/20 backdrop-blur-md font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold tracking-wider border border-[#6ff2ff]/30">
                  {featuredShow.quality || '1080p Ultra'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#32353e]/80 backdrop-blur-md font-['Space_Grotesk'] text-[10px] text-[#e0e2ee] flex items-center gap-1 border border-white/10">
                  <span className="material-symbols-outlined text-[13px] text-[#ffd700]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  {featuredShow.rating}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-['Space_Grotesk'] text-[24px] sm:text-[32px] font-bold text-white tracking-tight mb-1.5 drop-shadow-md">
                {featuredShow.title}
              </h1>

              {/* Metadata Row */}
              <div className="flex items-center gap-2 font-['Space_Grotesk'] text-[11px] text-[#8B95B2] mb-2 flex-wrap">
                <span className="text-[#ffb2bd] font-semibold">{featuredShow.year}</span>
                <span className="w-1 h-1 rounded-full bg-[#8B95B2]"></span>
                <span>{featuredShow.episodes_count} Episodes</span>
                <span className="w-1 h-1 rounded-full bg-[#8B95B2]"></span>
                <span className="text-[#6ff2ff] font-medium">{featuredShow.genres.replace(/,/g, ' • ')}</span>
              </div>

              <p className="font-['Plus_Jakarta_Sans'] text-[12px] sm:text-[13px] text-slate-300 line-clamp-2 mb-3 max-w-2xl drop-shadow">
                {featuredShow.synopsis}
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onResumeEpisode(featuredShow.id, 'neo-ronin-ep04')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff4e7b] text-white font-['Space_Grotesk'] text-[13px] font-bold shadow-[0_0_20px_rgba(255,78,123,0.6)] active:scale-95 hover:bg-[#ff2a6d] transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  <span>
                    Resume Ep 4 <span className="font-normal opacity-90 text-[10px]">(14:28)</span>
                  </span>
                </button>

                <button
                  onClick={() => onSelectShow(featuredShow)}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-[#272a33]/90 hover:bg-[#32353e] text-[#e0e2ee] border border-white/10 backdrop-blur-md shadow-md active:scale-95 transition-all"
                  title="View Episode Guide & Specs"
                >
                  <span className="material-symbols-outlined text-[20px]">info</span>
                </button>

                <button
                  onClick={() => onNavigateToVault()}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-[#272a33]/90 hover:bg-[#32353e] text-[#6ff2ff] border border-white/10 backdrop-blur-md shadow-md active:scale-95 transition-all"
                  title="Vault File Specs"
                >
                  <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Local Instant Search Quickbar */}
      <section className="px-4 mb-4">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[#6ff2ff] text-[20px] pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#272a33] text-[#e0e2ee] placeholder:text-[#8B95B2] font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:outline-none focus:border-[#6ff2ff] focus:shadow-[0_0_12px_rgba(111,242,255,0.25)] transition-all"
            placeholder="Search offline anime vault by title, genre, year..."
            type="text"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-[#8B95B2] hover:text-[#e0e2ee]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : (
            <button
              className="absolute right-3 p-1 text-[#8B95B2] hover:text-[#6ff2ff] transition-colors"
              title="Vault Filters"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. Continue Watching Carousel */}
      <section className="flex flex-col mb-6">
        <div className="px-4 flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ff4e7b] text-[20px]">history_toggle_off</span>
            <h2 className="font-['Space_Grotesk'] text-[18px] text-[#e0e2ee] font-bold">Continue Watching</h2>
          </div>
          <span className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] font-bold">3 in Queue</span>
        </div>

        {/* Horizontal Scroller */}
        <div className="flex overflow-x-auto gap-3 px-4 pb-2 scrollbar-none snap-x snap-mandatory">
          {/* Card 1: Neo Ronin Ep 4 */}
          <div
            onClick={() => onResumeEpisode('neo-ronin', 'neo-ronin-ep04')}
            className="snap-start shrink-0 w-[260px] bg-[#272a33] border border-white/[0.06] rounded-xl overflow-hidden shadow-lg flex flex-col group cursor-pointer hover:border-[#ff4e7b]/40 transition-all"
          >
            <div className="relative w-full h-32 bg-[#0b0e16]">
              <img
                alt="Neo Ronin Ep 04"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvjWSn3MMyaOmHYEXuqvkjLA3CldKanPAUzp0MhxAQ4razLBacmwLsrGmzB4VQOcqVbOWGb9iSlh1ykjS9b5Bva1zgeomL11u06W5n4kFcIVpSxgsY_4Cc4Z35wZKXvBwVwgKXnyjPqn678vdgqSHMbAQ6nSeHniOze2gMyklqdQ9-dfBsYs7N7vQcmGNUbYxlpQXPoYgSNVxK_OWXFbFbVfwP2q3rsQveCS6_hk7vqhs3fAph07nNJg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#272a33] via-transparent to-black/40"></div>
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm font-['Space_Grotesk'] text-[10px] font-mono text-[#6ff2ff]">
                14:28 / 24:00
              </div>
              <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#ff4e7b]/90 text-white flex items-center justify-center shadow-[0_0_16px_rgba(255,78,123,0.5)] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </div>
              {/* 60% Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full bg-[#0b0e16] h-1.5">
                <div className="h-full bg-[#ff4e7b] shadow-[0_0_8px_#ff4e7b]" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="p-3 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#e0e2ee] truncate group-hover:text-[#ff4e7b] transition-colors">
                  Neo Ronin: Cyber Attack
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-[12px] text-[#8B95B2] flex items-center gap-1 mt-0.5">
                  <span className="text-[#ffb2bd] font-medium">Ep 04</span> • <span className="text-[#e0e2ee] truncate">Neon Rain</span>
                </p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                <span className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] font-mono">60% watched</span>
                <span className="font-['Space_Grotesk'] text-[11px] text-[#8B95B2] flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px] text-[#6ff2ff]">offline_pin</span>
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Ghost Protocol Ep 11 */}
          <div
            onClick={() => onResumeEpisode('ghost-protocol', 'ghost-protocol-ep11')}
            className="snap-start shrink-0 w-[260px] bg-[#272a33] border border-white/[0.06] rounded-xl overflow-hidden shadow-lg flex flex-col group cursor-pointer hover:border-[#6ff2ff]/40 transition-all"
          >
            <div className="relative w-full h-32 bg-[#0b0e16]">
              <img
                alt="Ghost Protocol"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHwmlLEIuvjVlCujxe2cXzy07bIt14Dh_xdWmxfy9VEDLE5ClZvRo1wx6UH5eq_bi9JFnJQ7RI5Tgakdvz40LDTsmqySUh5s2mTSnGBis19rv58Lb8wXLlpciRY47sLNCZJ2Kd-Vcg7LIAx5MFEN5t-1RUGG74IlhVMRQmkRG6n8r-2tB1sdIbp9o4jkNd4MqYBluZphBzFAJ1oxUcL7nlhH24kFHtGJgh5h4MloW9eB6i_DBUmVnHnA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#272a33] via-transparent to-black/40"></div>
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm font-['Space_Grotesk'] text-[10px] font-mono text-[#6ff2ff]">
                21:05 / 23:50
              </div>
              <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#32353e]/90 text-[#ff4e7b] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </div>
              {/* 88% Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full bg-[#0b0e16] h-1.5">
                <div className="h-full bg-[#6ff2ff] shadow-[0_0_8px_#6ff2ff]" style={{ width: '88%' }}></div>
              </div>
            </div>

            <div className="p-3 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#e0e2ee] truncate group-hover:text-[#6ff2ff] transition-colors">
                  Ghost Protocol: Zero
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-[12px] text-[#8B95B2] flex items-center gap-1 mt-0.5">
                  <span className="text-[#6ff2ff] font-medium">Ep 11</span> • <span className="text-[#e0e2ee] truncate">System Overload</span>
                </p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                <span className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] font-mono">88% watched</span>
                <span className="font-['Space_Grotesk'] text-[11px] text-[#8B95B2] flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px] text-[#6ff2ff]">offline_pin</span>
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Mecha Soul Ep 01 */}
          <div
            onClick={() => onResumeEpisode('mecha-soul', 'mecha-soul-ep01')}
            className="snap-start shrink-0 w-[260px] bg-[#272a33] border border-white/[0.06] rounded-xl overflow-hidden shadow-lg flex flex-col group cursor-pointer hover:border-[#e0b6ff]/40 transition-all"
          >
            <div className="relative w-full h-32 bg-[#0b0e16]">
              <img
                alt="Mecha Soul"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBn6xLOLX-0q0zupAO-riqTh7utSlMcBRud0ixjh5hUJ2iQDMoNgvlg0MSjejzg704H-lxc9t0icvKUGq7IZG4LaI4DAR8S3UibwufcOloB6vNLt_xFuIzLtQ6qdCAgWFJWHjIWX-3Bgmz6vgwivyx1IoG0R6-Oa2G3k8rGvHoaG0faJ7RkQ97XUyEG9bCCVI_Z802qTAOT7QinuuKb38kS6UmErpkgTOiHshg_30O4cc5Ww1DS0pmQSA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#272a33] via-transparent to-black/40"></div>
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm font-['Space_Grotesk'] text-[10px] font-mono text-[#6ff2ff]">
                05:12 / 25:00
              </div>
              <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#32353e]/90 text-[#e0b6ff] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </div>
              {/* 20% Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full bg-[#0b0e16] h-1.5">
                <div className="h-full bg-[#e0b6ff] shadow-[0_0_8px_#e0b6ff]" style={{ width: '20%' }}></div>
              </div>
            </div>

            <div className="p-3 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#e0e2ee] truncate group-hover:text-[#e0b6ff] transition-colors">
                  Mecha Soul: Valkyrie
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-[12px] text-[#8B95B2] flex items-center gap-1 mt-0.5">
                  <span className="text-[#e0b6ff] font-medium">Ep 01</span> • <span className="text-[#e0e2ee] truncate">Awakening</span>
                </p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                <span className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] font-mono">20% watched</span>
                <span className="font-['Space_Grotesk'] text-[11px] text-[#8B95B2] flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px] text-[#6ff2ff]">offline_pin</span>
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Quick Genre Filter Pills */}
      <section className="flex flex-col mb-4">
        <div className="flex overflow-x-auto gap-2 px-4 pb-1 scrollbar-none">
          {genres.map((g) => {
            const rawG = g.split(' ')[0];
            const isSelected = selectedGenre === rawG || (rawG === 'All' && selectedGenre.startsWith('All'));
            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(rawG)}
                className={`px-3.5 py-1.5 rounded-full font-['Space_Grotesk'] text-[11px] font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#ff4e7b] text-white shadow-[0_0_12px_rgba(255,78,123,0.5)]'
                    : 'bg-[#272a33] text-[#e0e2ee] hover:text-[#6ff2ff] border border-white/[0.04]'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Trending in Local Vault (2-Col Responsive Grid) */}
      <section className="px-4 flex flex-col mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#6ff2ff] text-[20px]">bolt</span>
            <h2 className="font-['Space_Grotesk'] text-[18px] text-[#e0e2ee] font-bold">Trending in Local Vault</h2>
          </div>
          <button
            onClick={() => setSelectedGenre('All')}
            className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] font-bold hover:underline flex items-center gap-0.5"
          >
            See All ({filteredShows.length})
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {/* 2 Column Mobile, 4 Column Desktop Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredShows.map((show) => (
            <div
              key={show.id}
              onClick={() => onSelectShow(show)}
              className="w-full bg-[#272a33] border border-white/[0.06] rounded-xl overflow-hidden shadow-lg flex flex-col group cursor-pointer hover:border-[#ff4e7b]/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative w-full aspect-[2/3] bg-[#0b0e16] overflow-hidden">
                <img
                  alt={show.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={show.poster_url || show.banner_url}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#272a33] via-transparent to-black/30"></div>

                {/* Rating Chip */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md flex items-center gap-0.5 font-['Space_Grotesk'] text-[10px] text-[#ff4e7b] font-bold shadow-[0_0_8px_rgba(255,78,123,0.3)]">
                  <span className="material-symbols-outlined text-[12px] text-[#ffd700]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  {show.rating}
                </div>

                {/* Offline Download Pill */}
                <div className="absolute bottom-2 left-2 right-2 px-1.5 py-1 rounded bg-[#00d8e7]/20 border border-[#6ff2ff]/30 backdrop-blur-md flex items-center justify-center gap-1 font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold shadow-[0_0_8px_rgba(111,242,255,0.2)]">
                  <span className="material-symbols-outlined text-[13px]">offline_pin</span>
                  <span className="truncate">{show.download_status || 'Downloaded (1080p)'}</span>
                </div>
              </div>

              <div className="p-3 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-[13px] font-bold text-[#e0e2ee] truncate group-hover:text-[#ff4e7b] transition-colors">
                    {show.title}
                  </h3>
                  <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2] mt-0.5 truncate">
                    {show.genres.replace(/,/g, ' • ')}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-mono">
                    {show.episodes_count} Eps (All)
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#8B95B2] font-mono">
                    {show.size_gb} GB
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Quick Server Diagnostic Footer Card */}
      <section className="px-4 mb-4">
        <div className="bg-[#181b24] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#272a33] flex items-center justify-center text-[#6ff2ff] shadow-[0_0_12px_rgba(111,242,255,0.2)]">
              <span className="material-symbols-outlined text-[24px]">dns</span>
            </div>
            <div>
              <div className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#e0e2ee]">
                AnimeHub Daemon 2.4
              </div>
              <div className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2]">
                Hardware decoding enabled • NVDEC/VAAPI • SQLite WAL
              </div>
            </div>
          </div>
          <button
            onClick={onShowDaemonLogs}
            className="px-3 py-1 rounded-lg bg-[#272a33] hover:bg-[#32353e] text-[#6ff2ff] font-['Space_Grotesk'] text-[11px] font-mono border border-white/10 transition-colors"
          >
            Logs
          </button>
        </div>
      </section>
    </div>
  );
};
