/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimeShow, Episode } from './types/anime';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LibraryOverview } from './components/LibraryOverview';
import { SeriesDetails } from './components/SeriesDetails';
import { VideoPlayer } from './components/VideoPlayer';
import { VaultAdmin } from './components/VaultAdmin';
import { MediaLibrary } from './components/MediaLibrary';
import { ArchitectureModal } from './components/ArchitectureModal';
import { DaemonLogsModal } from './components/DaemonLogsModal';

type NavTab = 'home' | 'library' | 'player' | 'downloads' | 'vault';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentView, setCurrentView] = useState<'tab' | 'details'>('tab');
  const [shows, setShows] = useState<AnimeShow[]>([]);
  const [selectedShow, setSelectedShow] = useState<AnimeShow | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showArchitecture, setShowArchitecture] = useState<boolean>(false);
  const [showDaemonLogs, setShowDaemonLogs] = useState<boolean>(false);

  // Fetch shows from local SQLite backend
  const fetchShows = async () => {
    try {
      const res = await fetch('/api/shows');
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setShows(json.data);
      }
    } catch (err) {
      console.error('Failed to load anime catalog from SQLite:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  // Fetch full details of a show including episodes
  const handleSelectShow = async (show: AnimeShow) => {
    try {
      const res = await fetch(`/api/shows/${show.id}`);
      const json = await res.json();
      if (json.data) {
        setSelectedShow(json.data);
      } else {
        setSelectedShow(show);
      }
    } catch (e) {
      setSelectedShow(show);
    }
    setCurrentView('details');
  };

  // Play an episode directly in the player
  const handlePlayEpisode = async (showId: string, episodeId: string) => {
    try {
      const showRes = await fetch(`/api/shows/${showId}`);
      const showData = await showRes.json();
      if (showData.data) {
        setSelectedShow(showData.data);
        const ep = showData.data.episodes?.find((e: Episode) => e.id === episodeId);
        if (ep) {
          setSelectedEpisode(ep);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setCurrentTab('player');
    setCurrentView('tab');
  };

  // Toggle favorite in SQLite
  const handleToggleFavorite = async (showId: string) => {
    try {
      const res = await fetch(`/api/favorite/${showId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setShows((prev) =>
          prev.map((s) => (s.id === showId ? { ...s, is_favorite: data.is_favorite } : s))
        );
        if (selectedShow && selectedShow.id === showId) {
          setSelectedShow({ ...selectedShow, is_favorite: data.is_favorite });
        }
      }
    } catch (e) {
      console.error('Favorite toggle error:', e);
    }
  };

  const handleBack = () => {
    if (currentView === 'details') {
      setCurrentView('tab');
    } else {
      setCurrentTab('home');
    }
  };

  const activeShow = selectedShow || shows.find((s) => s.id === 'neo-ronin') || shows[0];
  const activeEpisode =
    selectedEpisode ||
    activeShow?.episodes?.find((e) => e.id === 'neo-ronin-ep04') ||
    activeShow?.episodes?.[0];

  return (
    <div className="min-h-screen bg-[#10131b] text-[#e0e2ee] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#ff4e7b] selection:text-white">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        activeShowTitle={activeShow?.title}
        canGoBack={currentView === 'details' || currentTab !== 'home'}
        onBack={handleBack}
        onOpenArchitecture={() => setShowArchitecture(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <span className="w-8 h-8 rounded-full border-2 border-[#6ff2ff] border-t-transparent animate-spin"></span>
            <span className="font-['Space_Grotesk'] text-[13px] text-[#6ff2ff] tracking-wider uppercase font-bold">
              Connecting to AnimeHub Local Daemon (127.0.0.1:5000)...
            </span>
          </div>
        ) : currentView === 'details' && selectedShow ? (
          <SeriesDetails
            show={selectedShow}
            onPlayEpisode={handlePlayEpisode}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setCurrentView('tab')}
          />
        ) : currentTab === 'home' ? (
          <LibraryOverview
            shows={shows}
            onSelectShow={handleSelectShow}
            onResumeEpisode={handlePlayEpisode}
            onNavigateToVault={() => setCurrentTab('vault')}
            onShowDaemonLogs={() => setShowDaemonLogs(true)}
          />
        ) : currentTab === 'library' ? (
          <MediaLibrary
            shows={shows}
            onSelectShow={handleSelectShow}
            onPlayEpisode={handlePlayEpisode}
          />
        ) : currentTab === 'player' ? (
          <VideoPlayer
            show={activeShow}
            episode={activeEpisode}
            onBack={() => setCurrentTab('home')}
            onSelectEpisode={handlePlayEpisode}
          />
        ) : currentTab === 'downloads' ? (
          <VaultAdmin
            initialTab="downloads"
            onPlayEpisode={handlePlayEpisode}
            onRefreshShows={fetchShows}
          />
        ) : currentTab === 'vault' ? (
          <VaultAdmin
            initialTab="admin"
            onPlayEpisode={handlePlayEpisode}
            onRefreshShows={fetchShows}
          />
        ) : null}
      </main>

      {/* Bottom Safe Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setCurrentView('tab');
        }}
        downloadCount={4}
      />

      {/* Architecture & Codebase Inspector Modal */}
      <ArchitectureModal
        isOpen={showArchitecture}
        onClose={() => setShowArchitecture(false)}
      />

      {/* Daemon 2.4 Logs & Telemetry Modal */}
      <DaemonLogsModal
        isOpen={showDaemonLogs}
        onClose={() => setShowDaemonLogs(false)}
      />
    </div>
  );
}
