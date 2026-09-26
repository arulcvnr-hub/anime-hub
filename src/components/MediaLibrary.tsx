import React, { useState } from 'react';
import { AnimeShow } from '../types/anime';

interface MediaLibraryProps {
  shows: AnimeShow[];
  onSelectShow: (show: AnimeShow) => void;
  onPlayEpisode: (showId: string, episodeId: string) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  shows,
  onSelectShow,
  onPlayEpisode,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'episodes'>('rating');

  const genres = ['All', 'Cyberpunk', 'Action', 'Sci-Fi', 'Mecha', 'Psychological', 'Fantasy', 'Thriller'];

  const filteredShows = shows
    .filter((s) => {
      const matchG = selectedGenre === 'All' || s.genres.toLowerCase().includes(selectedGenre.toLowerCase());
      const matchQ =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.japanese_title && s.japanese_title.includes(searchQuery)) ||
        s.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
      return matchG && matchQ;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'episodes') return b.episodes_count - a.episodes_count;
      return 0;
    });

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 pb-24">
      {/* Title & Stats */}
      <div className="pt-3 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-['Space_Grotesk'] text-[20px] font-bold text-white">Media Vault Library</h1>
          <p className="font-['Plus_Jakarta_Sans'] text-[12px] text-[#8B95B2]">
            {filteredShows.length} series stored in local SQLite database
          </p>
        </div>

        {/* Sort drop */}
        <div className="flex items-center gap-1.5 bg-[#272a33] px-2.5 py-1 rounded-lg border border-white/[0.08] text-[11px] font-['Space_Grotesk']">
          <span className="text-[#8B95B2]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-[#6ff2ff] font-bold focus:outline-none cursor-pointer"
          >
            <option value="rating" className="bg-[#181b24]">Top Rated</option>
            <option value="year" className="bg-[#181b24]">Release Year</option>
            <option value="episodes" className="bg-[#181b24]">Episode Count</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center my-3">
        <span className="material-symbols-outlined absolute left-3.5 text-[#6ff2ff] text-[20px] pointer-events-none">
          search
        </span>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#272a33] text-white placeholder:text-[#8B95B2] font-['Plus_Jakarta_Sans'] text-[13px] border border-white/[0.06] focus:border-[#6ff2ff] focus:outline-none"
          placeholder="Filter by title, keywords, studio..."
          type="text"
        />
      </div>

      {/* Genre Pills */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none mb-4">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3 py-1 rounded-full font-['Space_Grotesk'] text-[11px] font-bold shrink-0 transition-all ${
              selectedGenre === g
                ? 'bg-[#ff4e7b] text-white shadow-[0_0_12px_rgba(255,78,123,0.5)]'
                : 'bg-[#272a33] text-[#e0e2ee] hover:text-[#6ff2ff] border border-white/[0.04]'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
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

              {/* Rating */}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md flex items-center gap-0.5 font-['Space_Grotesk'] text-[10px] text-[#ff4e7b] font-bold shadow-[0_0_8px_rgba(255,78,123,0.3)]">
                <span className="material-symbols-outlined text-[12px] text-[#ffd700]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                {show.rating}
              </div>

              {/* Status pill */}
              <div className="absolute bottom-2 left-2 right-2 px-1.5 py-1 rounded bg-[#00d8e7]/20 border border-[#6ff2ff]/30 backdrop-blur-md flex items-center justify-center gap-1 font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-bold">
                <span className="material-symbols-outlined text-[13px]">offline_pin</span>
                <span className="truncate">{show.download_status || 'Downloaded'}</span>
              </div>
            </div>

            <div className="p-3 flex flex-col flex-grow justify-between">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[13px] font-bold text-white truncate group-hover:text-[#ff4e7b] transition-colors">
                  {show.title}
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2] mt-0.5 truncate">
                  {show.genres.replace(/,/g, ' • ')}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-mono">
                  {show.episodes_count} Eps
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#8B95B2] font-mono">
                  {show.size_gb} GB
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
