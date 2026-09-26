import React, { useState, useEffect, useRef } from 'react';
import { AnimeShow, Episode } from '../types/anime';

interface VideoPlayerProps {
  show?: AnimeShow;
  episode?: Episode;
  onBack: () => void;
  onSelectEpisode: (showId: string, episodeId: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  show,
  episode,
  onBack,
  onSelectEpisode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Playback state: initialize to 14:28 (868s) as in Image 6.png
  const [currentTime, setCurrentTime] = useState<number>(868);
  const [duration, setDuration] = useState<number>(1440); // 24:00
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedAudio, setSelectedAudio] = useState<'ja' | 'en'>('ja');
  const [selectedSub, setSelectedSub] = useState<'en' | 'ja' | 'ta' | 'es' | 'off'>('en');
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '720p' | '480p'>('1080p');
  const [postStatus, setPostStatus] = useState<string>('POST 200 OK');
  const [lastSyncTime, setLastSyncTime] = useState<string>('14:28');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Subtitle cue database (synchronized to current playback)
  const getActiveSubtitle = (time: number): string => {
    if (selectedSub === 'off') return '';
    if (selectedSub === 'ja') {
      if (time >= 860 && time <= 875) return '「雨に刻まれたコードを断ち切ることはできない…」';
      if (time >= 10 && time <= 25) return 'レン: 神経ダンパーが機能不全を起こしている。有機記憶が漏れ出している。';
      return '';
    }
    if (selectedSub === 'ta') {
      if (time >= 860 && time <= 875) return '“மழையில் குறியிடப்பட்டதை உங்களால் வெட்ட முடியாது...”';
      return '';
    }
    // English (Default)
    if (time >= 860 && time <= 875) {
      return '“You cannot sever what has already been encoded into the rain...”';
    }
    if (time >= 10 && time <= 20) {
      return 'Ren: The neural dampeners are failing. My organic memories are leaking through the encryption.';
    }
    if (time >= 21 && time <= 30) {
      return 'Kageyama: Stay focused, Ren. Corporate hunters just tripped the perimeter subnet.';
    }
    return '';
  };

  // Auto-sync progress to SQLite backend every 5 seconds
  useEffect(() => {
    const syncProgressToBackend = async () => {
      try {
        const epId = episode?.id || 'neo-ronin-ep04';
        const showId = show?.id || 'neo-ronin';
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episode_id: epId,
            anime_id: showId,
            progress_seconds: Math.floor(currentTime),
            duration_seconds: Math.floor(duration),
          }),
        });
        if (res.ok) {
          setPostStatus('POST 200 OK');
          setLastSyncTime(formatTime(currentTime));
        }
      } catch (e) {
        setPostStatus('CACHE LOCAL');
      }
    };

    const interval = setInterval(syncProgressToBackend, 5000);
    return () => clearInterval(interval);
  }, [currentTime, duration, episode, show]);

  // Video element event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setDuration(video.duration);
      }
      video.currentTime = 868; // Seek to 14:28
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const skipSeconds = (delta: number) => {
    const next = Math.max(0, Math.min(duration, currentTime + delta));
    setCurrentTime(next);
    if (videoRef.current) {
      videoRef.current.currentTime = next;
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(e.target.value);
    setCurrentTime(next);
    if (videoRef.current) {
      videoRef.current.currentTime = next;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error('PiP error:', err);
      }
    }
  };

  const activeSubtitleText = getActiveSubtitle(currentTime);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-24">
      {/* 1. Fullscreen / Responsive Video Viewport */}
      <section
        ref={containerRef}
        className="relative w-full aspect-video bg-[#0b0e16] overflow-hidden select-none group border-b border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.8)]"
        onMouseMove={() => setControlsVisible(true)}
      >
        {/* Real HTML5 Video connected to HTTP 206 stream */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src="/stream/neo-ronin-ep04"
          playsInline
          loop
          autoPlay
          muted
        />

        {/* Cinematic Backdrop Scrim & Grid Texture */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10131b] via-transparent to-[#10131b]/90 pointer-events-none"></div>
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#6ff2ff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Top HUD Bar */}
        <div
          className={`absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-[#0b0e16]/95 via-[#0b0e16]/70 to-transparent flex flex-col gap-1.5 z-20 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-full bg-[#1d1f28]/70 backdrop-blur-md flex items-center justify-center text-[#e0e2ee] hover:text-[#6ff2ff] active:scale-95 transition-all border border-white/10"
                title="Back to series details"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back_ios_new</span>
              </button>

              <div className="flex flex-col min-w-0">
                <span className="font-['Space_Grotesk'] text-[13px] text-white truncate font-bold">
                  {show?.title || 'Neo Ronin: Cyber Attack'}
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#6ff2ff] truncate">
                  {episode
                    ? `S1:E${episode.episode_number} “${episode.title}”`
                    : 'S1:E4 “Neon Rain & Broken Circuits”'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setSelectedSub(selectedSub === 'off' ? 'en' : 'off')}
                className={`px-2 py-0.5 rounded-full font-['Space_Grotesk'] text-[10px] font-bold backdrop-blur-sm border transition-all ${
                  selectedSub !== 'off'
                    ? 'bg-[#ff4e7b] text-white border-[#ff4e7b]/50 shadow-[0_0_8px_rgba(255,78,123,0.5)]'
                    : 'bg-[#272a33]/80 text-[#8B95B2] border-white/10'
                }`}
              >
                CC
              </button>

              <button
                onClick={() => setSelectedAudio(selectedAudio === 'ja' ? 'en' : 'ja')}
                className="px-2 py-0.5 rounded-full bg-[#272a33]/80 text-[#e0e2ee] font-['Space_Grotesk'] text-[10px] font-bold border border-white/10 backdrop-blur-sm"
              >
                {selectedAudio === 'ja' ? 'JA 5.1' : 'EN DUB'}
              </button>

              <button
                className="w-7 h-7 rounded-full bg-[#272a33]/80 text-[#e0e2ee] hover:text-[#6ff2ff] flex items-center justify-center border border-white/10"
                title="Player Settings"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
              </button>
            </div>
          </div>

          {/* Local Loopback Stream Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#181b24]/80 backdrop-blur-sm w-fit self-start border border-white/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6ff2ff] shadow-[0_0_6px_#6ff2ff] animate-pulse"></span>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#8B95B2] tracking-wider uppercase truncate max-w-[280px]">
              LOCAL /media/videos/Neo_Ronin/Ep04.mp4 • HTTP 206
            </span>
          </div>
        </div>

        {/* Center Control Glyphs */}
        <div className="absolute inset-0 flex items-center justify-center z-10 gap-8 pointer-events-auto">
          <button
            onClick={() => skipSeconds(-10)}
            className="w-10 h-10 rounded-full bg-[#272a33]/60 backdrop-blur-md flex items-center justify-center text-[#e0e2ee] hover:text-[#6ff2ff] active:scale-90 transition-all border border-white/10"
            title="Rewind 10 seconds"
          >
            <span className="material-symbols-outlined text-[24px]">replay_10</span>
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-[#ff4e7b] hover:bg-[#ff2a6d] text-white flex items-center justify-center shadow-[0_0_24px_rgba(255,78,123,0.7)] active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={() => skipSeconds(10)}
            className="w-10 h-10 rounded-full bg-[#272a33]/60 backdrop-blur-md flex items-center justify-center text-[#e0e2ee] hover:text-[#6ff2ff] active:scale-90 transition-all border border-white/10"
            title="Fast forward 10 seconds"
          >
            <span className="material-symbols-outlined text-[24px]">forward_10</span>
          </button>
        </div>

        {/* Subtitle Cue Render Overlay */}
        {activeSubtitleText && (
          <div className="absolute bottom-10 left-0 right-0 text-center px-4 z-10 pointer-events-none">
            <p className="inline-block px-3 py-1 rounded bg-[#0b0e16]/85 backdrop-blur-sm font-['Space_Grotesk'] text-[13px] sm:text-[15px] text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide font-bold border border-amber-300/20">
              {activeSubtitleText}
            </p>
          </div>
        )}

        {/* Bottom Playback & Scrubber Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#10131b] via-[#10131b]/80 to-transparent z-20 flex flex-col gap-1.5 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Custom Cyberpunk Scrub Range */}
          <div className="relative w-full flex items-center h-4 cursor-pointer group/scrub">
            <input
              type="range"
              min="0"
              max={duration}
              step="1"
              value={currentTime}
              onChange={handleScrubberChange}
              className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer"
            />
            {/* Background track */}
            <div className="absolute w-full h-1 bg-[#32353e] rounded-full"></div>
            {/* Buffered track (72%) */}
            <div className="absolute left-0 h-1 w-[72%] bg-[#6ff2ff]/40 rounded-full"></div>
            {/* Played track */}
            <div
              className="absolute left-0 h-1 bg-[#ff4e7b] rounded-full shadow-[0_0_10px_rgba(255,78,123,0.7)]"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
            {/* Scrubber Knob */}
            <div
              className="absolute -translate-x-1/2 w-3.5 h-3.5 bg-[#6ff2ff] rounded-full shadow-[0_0_12px_#6ff2ff] transition-transform group-hover/scrub:scale-125"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>

          {/* Time & Auxiliary Action Icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-['Space_Grotesk'] text-[11px]">
              <span className="text-[#6ff2ff] font-bold">{formatTime(currentTime)}</span>
              <span className="text-[#8B95B2]">/</span>
              <span className="text-[#8B95B2]">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => skipSeconds(-60)}
                className="text-[#8B95B2] hover:text-white flex items-center"
                title="Previous Chapter"
              >
                <span className="material-symbols-outlined text-[18px]">skip_previous</span>
              </button>

              <button
                onClick={cycleSpeed}
                className="font-['Space_Grotesk'] text-[10px] px-1.5 py-0.5 rounded bg-[#272a33] text-[#6ff2ff] font-bold hover:bg-[#32353e] transition-colors"
                title="Playback Speed"
              >
                {playbackSpeed.toFixed(1)}x
              </button>

              <button
                onClick={() => skipSeconds(60)}
                className="text-[#8B95B2] hover:text-white flex items-center"
                title="Next Chapter"
              >
                <span className="material-symbols-outlined text-[18px]">skip_next</span>
              </button>

              <button
                onClick={togglePiP}
                className="text-[#8B95B2] hover:text-white flex items-center"
                title="Picture in Picture"
              >
                <span className="material-symbols-outlined text-[18px]">picture_in_picture_alt</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="text-[#8B95B2] hover:text-[#6ff2ff] flex items-center"
                title="Fullscreen"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Lossless SQLite Progress Save Bar */}
      <div className="px-4 py-2 bg-[#0b0e16] flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[#ff4e7b] text-[18px] shrink-0 animate-bounce">
            push_pin
          </span>
          <span className="font-['Space_Grotesk'] text-[11px] text-[#e0e2ee] truncate">
            Resumed from {lastSyncTime} • Saved to SQLite local cache
          </span>
        </div>
        <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] bg-[#00d8e7]/15 border border-[#6ff2ff]/30 px-2 py-0.5 rounded-full shrink-0 font-bold">
          {postStatus}
        </span>
      </div>

      {/* 3. Sync State & Architecture Card */}
      <div className="p-4 flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-[#181b24] border border-white/[0.06] shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[12px] text-white font-bold uppercase tracking-wider">
              Sync State
            </span>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6ff2ff] animate-ping"></span>
              ACTIVE SESSION
            </span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] text-[12px] text-[#8B95B2] leading-relaxed">
            Playback Position automatically syncing with local SQLite database (
            <code className="text-[#ff4e7b] font-bold">POST /api/progress</code> at interval: 5s). Resuming is
            lossless across offline &amp; LAN devices.
          </p>
        </div>

        {/* 4. Tracks & Render Quality Multi-Tier Selector */}
        <div className="flex flex-col gap-3">
          <span className="font-['Space_Grotesk'] text-[16px] text-white font-bold">
            Tracks &amp; Render Quality
          </span>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Audio Stream */}
            <div className="p-3.5 rounded-xl bg-[#181b24] border border-white/[0.06] flex flex-col gap-2">
              <span className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] uppercase font-bold tracking-wider">
                Audio Stream
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAudio('ja')}
                  className={`px-3 py-1.5 rounded-lg font-['Space_Grotesk'] text-[12px] font-bold flex items-center gap-1 transition-all ${
                    selectedAudio === 'ja'
                      ? 'bg-[#ff4e7b] text-white shadow-[0_0_12px_rgba(255,78,123,0.4)]'
                      : 'bg-[#272a33] text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  {selectedAudio === 'ja' && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                  Japanese (Original FLAC)
                </button>

                <button
                  onClick={() => setSelectedAudio('en')}
                  className={`px-3 py-1.5 rounded-lg font-['Space_Grotesk'] text-[12px] font-bold flex items-center gap-1 transition-all ${
                    selectedAudio === 'en'
                      ? 'bg-[#ff4e7b] text-white shadow-[0_0_12px_rgba(255,78,123,0.4)]'
                      : 'bg-[#272a33] text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  {selectedAudio === 'en' && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                  English Dub (AAC 5.1)
                </button>
              </div>
            </div>

            {/* Subtitles Track */}
            <div className="p-3.5 rounded-xl bg-[#181b24] border border-white/[0.06] flex flex-col gap-2">
              <span className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] uppercase font-bold tracking-wider">
                Subtitles Track
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSub('en')}
                  className={`px-3 py-1.5 rounded-lg font-['Space_Grotesk'] text-[12px] font-bold shadow-sm transition-all ${
                    selectedSub === 'en'
                      ? 'bg-[#ff4e7b] text-white shadow-[0_0_10px_rgba(255,78,123,0.4)]'
                      : 'bg-[#272a33] text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  English [.vtt active]
                </button>
                <button
                  onClick={() => setSelectedSub('ja')}
                  className={`px-3 py-1.5 rounded-lg font-['Space_Grotesk'] text-[12px] font-bold transition-all ${
                    selectedSub === 'ja'
                      ? 'bg-[#ff4e7b] text-white shadow-[0_0_10px_rgba(255,78,123,0.4)]'
                      : 'bg-[#272a33] text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  Japanese [.vtt]
                </button>
                <button
                  onClick={() => setSelectedSub('ta')}
                  className={`px-3 py-1.5 rounded-lg font-['Space_Grotesk'] text-[12px] font-bold transition-all ${
                    selectedSub === 'ta'
                      ? 'bg-[#ff4e7b] text-white shadow-[0_0_10px_rgba(255,78,123,0.4)]'
                      : 'bg-[#272a33] text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  Tamil [.vtt]
                </button>
                <button
                  onClick={() => setSelectedSub('es')}
                  className={`px-3 py-1.5 rounded-lg font-['Space_Grotesk'] text-[12px] font-bold transition-all ${
                    selectedSub === 'es'
                      ? 'bg-[#ff4e7b] text-white shadow-[0_0_10px_rgba(255,78,123,0.4)]'
                      : 'bg-[#272a33] text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  Spanish [.srt]
                </button>
                <button
                  onClick={() => setSelectedSub('off')}
                  className={`px-3 py-1.5 rounded-lg font-['Space_Grotesk'] text-[12px] font-bold transition-all ${
                    selectedSub === 'off'
                      ? 'bg-[#ff4e7b] text-white shadow-[0_0_10px_rgba(255,78,123,0.4)]'
                      : 'bg-[#272a33] text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Local Master File Resolution */}
            <div className="p-3.5 rounded-xl bg-[#181b24] border border-white/[0.06] flex flex-col gap-2">
              <span className="font-['Space_Grotesk'] text-[11px] text-[#6ff2ff] uppercase font-bold tracking-wider">
                Local Master File
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedQuality('1080p')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    selectedQuality === '1080p'
                      ? 'bg-[#00d8e7]/20 border-[#6ff2ff]/40 text-[#6ff2ff] shadow-[0_0_8px_rgba(111,242,255,0.25)]'
                      : 'bg-[#272a33] border-white/5 text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  <span className="font-['Space_Grotesk'] text-[13px] font-bold">1080p</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px]">
                    422 MB {selectedQuality === '1080p' && '• Active'}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedQuality('720p')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    selectedQuality === '720p'
                      ? 'bg-[#00d8e7]/20 border-[#6ff2ff]/40 text-[#6ff2ff] shadow-[0_0_8px_rgba(111,242,255,0.25)]'
                      : 'bg-[#272a33] border-white/5 text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  <span className="font-['Space_Grotesk'] text-[13px] font-bold">720p</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px]">240 MB</span>
                </button>

                <button
                  onClick={() => setSelectedQuality('480p')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    selectedQuality === '480p'
                      ? 'bg-[#00d8e7]/20 border-[#6ff2ff]/40 text-[#6ff2ff] shadow-[0_0_8px_rgba(111,242,255,0.25)]'
                      : 'bg-[#272a33] border-white/5 text-[#8B95B2] hover:bg-[#32353e]'
                  }`}
                >
                  <span className="font-['Space_Grotesk'] text-[13px] font-bold">480p</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px]">120 MB</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Season Episodes Quick Selector */}
        <div className="flex flex-col gap-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[16px] text-white font-bold">
              Season Episodes
            </span>
            <span className="font-['Space_Grotesk'] text-[11px] text-[#8B95B2]">
              Season 1 • 12 Episodes
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {/* Active Ep 04 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#272a33] border border-[#ff4e7b]/30 shadow-sm">
              <div className="w-20 aspect-video rounded-lg overflow-hidden shrink-0 relative bg-[#0b0e16]">
                <img
                  alt="Neon Rain"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvjWSn3MMyaOmHYEXuqvkjLA3CldKanPAUzp0MhxAQ4razLBacmwLsrGmzB4VQOcqVbOWGb9iSlh1ykjS9b5Bva1zgeomL11u06W5n4kFcIVpSxgsY_4Cc4Z35wZKXvBwVwgKXnyjPqn678vdgqSHMbAQ6nSeHniOze2gMyklqdQ9-dfBsYs7N7vQcmGNUbYxlpQXPoYgSNVxK_OWXFbFbVfwP2q3rsQveCS6_hk7vqhs3fAph07nNJg"
                />
                <div className="absolute inset-0 bg-[#ff4e7b]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ff4e7b] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-['Space_Grotesk'] text-[12px] text-[#ff4e7b] font-bold truncate">
                    EP 04 • Neon Rain
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#ff4e7b] font-bold">Playing</span>
                </div>
                <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2] truncate">
                  Broken circuits spark in Sector 9.
                </p>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#6ff2ff] font-mono">
                  14:28 / 24:00
                </span>
              </div>
            </div>

            {/* Ep 05 */}
            <div
              onClick={() => onSelectEpisode('neo-ronin', 'neo-ronin-ep05')}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#181b24] hover:bg-[#272a33] border border-white/[0.04] transition-colors cursor-pointer"
            >
              <div className="w-20 aspect-video rounded-lg overflow-hidden shrink-0 relative bg-[#0b0e16]">
                <img
                  alt="Ep 05"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIJgDuPtfProQsfV5HSaYXkzrv7OP-mIBB1PrLzPM-x8b7Rfs_uEPcUTvd_HcV6VdzFzX82wMEWGdzFdZq6cNRI1BnhG-No3kQ8WmpzdEZf7awPGfU3arB4gYnHaZkM_3pB79DootHa6cRvl3UdTLQ6GHUEHPM9Q2DEx2Tx1sqPE4Z4fzcvDZm3xlKiGqDYMh03tUgekTK1pthmqqWm2BfWET61g3SkEi7_oBEwihUs-Fs2cwU3Z8vqw"
                />
                <span className="absolute bottom-1 right-1 font-['Space_Grotesk'] text-[9px] bg-black/80 px-1 rounded text-white">
                  23:45
                </span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-['Space_Grotesk'] text-[12px] text-white font-bold truncate">
                  EP 05 • The Datastream Rift
                </span>
                <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2] truncate">
                  An encrypted signal pierces the blackout grid.
                </p>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#8B95B2]">Ready • 1080p Local</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-[#272a33] flex items-center justify-center text-[#e0e2ee] hover:text-[#6ff2ff] shrink-0">
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              </button>
            </div>

            {/* Ep 06 */}
            <div
              onClick={() => onSelectEpisode('neo-ronin', 'neo-ronin-ep06')}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#181b24] hover:bg-[#272a33] border border-white/[0.04] transition-colors cursor-pointer"
            >
              <div className="w-20 aspect-video rounded-lg overflow-hidden shrink-0 relative bg-[#0b0e16]">
                <img
                  alt="Ep 06"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKyYTz7Q8NsTDUJRshYkCzwGWZalhNpyMIoGqp_oEbHst0WujxXmcLgw8xZeQ-JyhIs9Gh2gRY8nntsScsvvRtl0ro1hXFQxUHKBmEd_fjLt8hgnaAnbcDbLwjzyNsj-simdxJNa-PGB5pLYnGt3xPtnNAplJZntqCFLYr7xEVhiHAORr9pO9RIPMSVzFvDq1DT7_f5jE9YWpp1AsS4pXvFPYFlg_oigKc0kh4VLQmDl6xq6j0rgKJWA"
                />
                <span className="absolute bottom-1 right-1 font-['Space_Grotesk'] text-[9px] bg-black/80 px-1 rounded text-white">
                  24:12
                </span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-['Space_Grotesk'] text-[12px] text-white font-bold truncate">
                  EP 06 • Synapse Protocol
                </span>
                <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#8B95B2] truncate">
                  Kageyama overrides the subnet authority.
                </p>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#8B95B2]">Ready • 1080p Local</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-[#272a33] flex items-center justify-center text-[#e0e2ee] hover:text-[#6ff2ff] shrink-0">
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
