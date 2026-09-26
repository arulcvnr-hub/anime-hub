import React, { useState } from 'react';
import { AnimeShow, Episode } from '../types/anime';

interface SeriesDetailsProps {
  show: AnimeShow;
  onPlayEpisode: (showId: string, episodeId: string) => void;
  onToggleFavorite: (showId: string) => void;
  onBack: () => void;
}

export const SeriesDetails: React.FC<SeriesDetailsProps> = ({
  show,
  onPlayEpisode,
  onToggleFavorite,
  onBack,
}) => {
  const [filterDownloadedOnly, setFilterDownloadedOnly] = useState<boolean>(false);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(0);
  const qualities = ['1080p FHD (FLAC)', '720p HD (AAC 5.1)', '4K UHD HDR (TrueHD)'];

  const episodes = show.episodes || [];
  const filteredEpisodes = filterDownloadedOnly
    ? episodes.filter((e) => e.download_status === 'downloaded')
    : episodes;

  const cycleQuality = () => {
    setSelectedQualityIndex((prev) => (prev + 1) % qualities.length);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-24">
      {/* 1. Hero Key Visual Banner */}
      <div className="relative w-full overflow-hidden bg-[#0b0e16]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,78,123,0.25),_transparent_70%)] pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#10131b] via-[#10131b]/60 to-transparent z-10"></div>

        <div className="relative w-full aspect-[4/5] max-h-[460px] overflow-hidden">
          <img
            alt={show.title}
            className="w-full h-full object-cover object-top scale-105 filter contrast-110 brightness-95"
            src={show.banner_url || show.poster_url}
          />

          {/* Floating Badges */}
          <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-[#272a33]/90 border border-[#ff4e7b]/30 backdrop-blur-md shadow-[0_0_12px_rgba(255,78,123,0.35)]">
            <span className="w-2 h-2 rounded-full bg-[#ff4e7b] animate-pulse"></span>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#ffb2bd] tracking-widest uppercase font-bold">
              Key Visual • Ready to Stream
            </span>
          </div>

          <div className="absolute bottom-3 right-4 z-20 px-2.5 py-1 rounded-full bg-[#00d8e7]/20 border border-[#6ff2ff]/30 backdrop-blur-md shadow-[0_0_10px_rgba(111,242,255,0.25)]">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold">
              MKV • DUAL AUDIO
            </span>
          </div>
        </div>
      </div>

      {/* 2. Series Metadata Floating Card */}
      <div className="relative px-4 -mt-6 z-20 flex flex-col gap-3">
        <div className="p-4 rounded-xl bg-[#1d1f28]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[11px] text-[#ff4e7b] uppercase tracking-widest font-bold">
              {show.studio || 'Studio Triggerhead'}
            </span>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#32353e]">
              <span className="material-symbols-outlined text-[14px] text-[#ff4e7b]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-['Space_Grotesk'] text-[11px] text-[#ffb2bd] font-bold">{show.rating}</span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#8B95B2] font-normal">
                ({(show.rating_count / 1000).toFixed(1)}k)
              </span>
            </div>
          </div>

          <h1 className="font-['Space_Grotesk'] text-[24px] sm:text-[30px] font-bold text-white tracking-tight leading-none mt-0.5">
            {show.title}
          </h1>

          {show.japanese_title && (
            <p className="font-['Plus_Jakarta_Sans'] text-[14px] text-[#ffb2bd] font-semibold tracking-wide">
              {show.japanese_title}
              {show.romaji_title && (
                <span className="text-[#8B95B2] font-normal text-[12px] ml-1.5">— {show.romaji_title}</span>
              )}
            </p>
          )}

          {/* Badges Pill Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#272a33] text-[#8B95B2] font-['Space_Grotesk'] text-[10px] font-medium">
              {show.year}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#00d8e7]/15 text-[#6ff2ff] font-['Space_Grotesk'] text-[10px] font-bold border border-[#6ff2ff]/25">
              Status: {show.status || 'Completed'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#272a33] text-[#8B95B2] font-['Space_Grotesk'] text-[10px] font-medium">
              {show.quality || '1080p WebM/MKV'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#bb6bfb]/15 text-[#e0b6ff] font-['Space_Grotesk'] text-[10px] font-bold border border-[#e0b6ff]/25">
              {show.episodes_count} Episodes
            </span>
          </div>

          {/* Genre Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {(show.genres_list || show.genres.split(',')).map((genre) => (
              <span
                key={genre}
                className="px-2.5 py-0.5 rounded-full bg-[#0b0e16] text-[#e0e2ee] border border-white/[0.06] font-['Space_Grotesk'] text-[10px]"
              >
                {genre.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Interactive Action Row */}
        <div className="grid grid-cols-4 gap-2">
          {/* Primary Play Button */}
          <button
            onClick={() => onPlayEpisode(show.id, 'neo-ronin-ep04')}
            className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#ff4e7b] hover:bg-[#ff2a6d] text-white font-['Space_Grotesk'] text-[13px] uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(255,78,123,0.45)] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
            <span>Play Ep 4</span>
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(show.id)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#272a33] border border-white/[0.08] active:scale-90 transition-all ${
              show.is_favorite
                ? 'text-[#ff4e7b] shadow-[0_0_12px_rgba(255,78,123,0.3)]'
                : 'text-[#8B95B2] hover:text-[#e0e2ee]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: show.is_favorite ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            <span className="font-['Space_Grotesk'] text-[10px] mt-0.5">
              {show.is_favorite ? 'Favorited' : 'Favorite'}
            </span>
          </button>

          {/* Download Pack */}
          <button
            onClick={() => alert(`Offline package ready: ${show.size_gb} GB verified in local partition.`)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#272a33] border border-white/[0.08] text-[#6ff2ff] active:scale-90 transition-all hover:border-[#6ff2ff]/40 shadow-[0_0_10px_rgba(111,242,255,0.15)]"
          >
            <span className="material-symbols-outlined text-[22px]">download_for_offline</span>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#e0e2ee] mt-0.5">
              {show.size_gb || 8.4} GB
            </span>
          </button>
        </div>

        {/* 4. Playback Engine / Quality Switcher */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#181b24] border border-white/[0.06] text-[#8B95B2] font-['Plus_Jakarta_Sans'] text-[12px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#6ff2ff]">tune</span>
            <span>Playback Engine:</span>
            <button
              onClick={cycleQuality}
              className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] font-bold hover:underline"
            >
              {qualities[selectedQualityIndex]}
            </button>
          </div>
          <span className="font-['Space_Grotesk'] text-[10px] px-2 py-0.5 rounded bg-[#32353e] text-[#e0e2ee]">
            Local Native
          </span>
        </div>

        {/* 5. Synopsis & Diagnostics Card */}
        <div className="p-4 rounded-xl bg-[#1d1f28]/70 border border-white/[0.06] backdrop-blur-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-['Space_Grotesk'] text-[12px] text-[#e0e2ee] uppercase tracking-wider font-bold">
              Synopsis
            </h2>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#ff4e7b] tracking-widest font-semibold">
              SEASON 01
            </span>
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-[13px] text-[#8B95B2] leading-relaxed">
            {show.synopsis}
          </p>

          {/* Local File System Diagnostics Bar */}
          <div className="mt-2 pt-2 bg-[#0b0e16]/80 border border-white/[0.04] rounded-lg p-2.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#6ff2ff]">folder_open</span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold">STORAGE PATH:</span>
              <span className="font-mono text-[10px] text-[#8B95B2] truncate">{show.storage_path}</span>
            </div>
            <div className="flex items-center justify-between text-[#8B95B2] font-['Space_Grotesk'] text-[10px]">
              <span>
                Subtitles: <strong className="text-[#e0e2ee]">.vtt (EN, JA, ES, TA)</strong>
              </span>
              <span>
                Audio: <strong className="text-[#6ff2ff]">Dual FLAC 2.0</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 6. Subtitles CC Pill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#272a33]/60 border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#ff4e7b] text-white font-['Space_Grotesk'] text-[10px] font-bold">
              CC
            </span>
            <span className="font-['Plus_Jakarta_Sans'] text-[12px] text-[#e0e2ee] truncate">
              Subs: English (.vtt), Japanese (Original), Tamil (.vtt), Spanish
            </span>
          </div>
          <span className="material-symbols-outlined text-[20px] text-[#6ff2ff]">subtitles</span>
        </div>

        {/* 7. Episodes Filter Tabs */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <h2 className="font-['Space_Grotesk'] text-[18px] text-[#e0e2ee] font-bold">Episodes</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#32353e] text-[#6ff2ff] font-['Space_Grotesk'] text-[10px] font-bold">
              {episodes.length} Total
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0b0e16] border border-white/[0.04]">
            <button
              onClick={() => setFilterDownloadedOnly(false)}
              className={`px-3 py-1 rounded-lg font-['Space_Grotesk'] text-[11px] font-bold transition-all ${
                !filterDownloadedOnly
                  ? 'bg-[#272a33] text-[#ff4e7b] shadow-sm'
                  : 'text-[#8B95B2] hover:text-[#e0e2ee]'
              }`}
            >
              All ({episodes.length})
            </button>
            <button
              onClick={() => setFilterDownloadedOnly(true)}
              className={`px-3 py-1 rounded-lg font-['Space_Grotesk'] text-[11px] font-bold transition-all ${
                filterDownloadedOnly
                  ? 'bg-[#272a33] text-[#ff4e7b] shadow-sm'
                  : 'text-[#8B95B2] hover:text-[#e0e2ee]'
              }`}
            >
              Downloaded
            </button>
          </div>
        </div>

        {/* 8. Episode List */}
        <div className="flex flex-col gap-2.5 pb-8">
          {filteredEpisodes.map((ep) => {
            const isCurrent = ep.id === 'neo-ronin-ep04';
            const isCompleted = ep.is_completed || ep.progress_seconds >= ep.duration;
            const progressPercent = Math.min(
              100,
              Math.floor((ep.progress_seconds / (ep.duration || 1440)) * 100)
            );

            return (
              <div
                key={ep.id}
                onClick={() => onPlayEpisode(show.id, ep.id)}
                className={`group relative flex flex-col p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#272a33]/90 border-[#ff4e7b]/40 shadow-[0_0_16px_rgba(255,78,123,0.25)]'
                    : 'bg-[#1d1f28]/70 border-white/[0.06] hover:bg-[#272a33]/70'
                }`}
              >
                <div className="flex gap-3 items-center">
                  {/* Thumbnail Frame */}
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-[#0b0e16] shadow-md">
                    <img
                      alt={ep.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={ep.thumbnail_url}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                    <span className="absolute bottom-1 right-1.5 font-['Space_Grotesk'] text-[9px] text-white font-semibold px-1 rounded bg-black/75">
                      {isCurrent ? '14:28 / 24:00' : `${Math.floor(ep.duration / 60)}:${(ep.duration % 60).toString().padStart(2, '0')}`}
                    </span>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`material-symbols-outlined text-[24px] ${
                          isCurrent
                            ? 'text-[#ff4e7b] animate-pulse'
                            : 'text-white/80 group-hover:scale-110'
                        } transition-transform`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isCompleted ? 'replay' : 'play_arrow'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#32353e]">
                      <div
                        className={`h-full ${isCurrent ? 'bg-[#ff4e7b] shadow-[0_0_8px_#ff4e7b]' : 'bg-[#6ff2ff]'}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col min-w-0 flex-1 justify-center">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-['Space_Grotesk'] text-[10px] font-bold ${
                          isCurrent ? 'text-[#ff4e7b]' : 'text-[#6ff2ff]'
                        }`}
                      >
                        EP {ep.episode_number.toString().padStart(2, '0')}
                      </span>

                      {isCurrent ? (
                        <span className="font-['Space_Grotesk'] text-[9px] px-1.5 py-0.2 rounded bg-[#ff4e7b] text-white font-bold shadow-sm">
                          RESUME
                        </span>
                      ) : isCompleted ? (
                        <span className="font-['Space_Grotesk'] text-[9px] px-1.5 py-0.2 rounded bg-[#32353e] text-[#8B95B2]">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="font-['Space_Grotesk'] text-[9px] px-1.5 py-0.2 rounded bg-[#272a33] text-[#8B95B2]">
                          UNWATCHED
                        </span>
                      )}
                    </div>

                    <h3 className="font-['Plus_Jakarta_Sans'] text-[13px] text-white font-bold truncate mt-0.5">
                      {ep.title}
                    </h3>
                    <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2] truncate">
                      {isCurrent ? '10 min remaining • Local FLAC' : ep.synopsis}
                    </p>
                  </div>

                  {/* Play Action */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button
                      className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full transition-all ${
                        isCurrent
                          ? 'bg-[#ff4e7b] text-white shadow-[0_0_12px_rgba(255,78,123,0.5)]'
                          : 'bg-[#272a33] text-[#6ff2ff] hover:bg-[#32353e]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_arrow
                      </span>
                    </button>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#8B95B2] flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px] text-[#6ff2ff]">check_circle</span>
                      {ep.file_size_mb}MB
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
