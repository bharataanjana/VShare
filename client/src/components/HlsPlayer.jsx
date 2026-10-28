import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, FastForward } from 'lucide-react';
import { BACKEND_URL } from '../services/api';

export default function HlsPlayer({ video }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [qualities, setQualities] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(-1); // -1 = Auto
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef(null);

  const hlsUrl = video?.masterM3U8
    ? (video.masterM3U8.startsWith('http') ? video.masterM3U8 : BACKEND_URL + video.masterM3U8)
    : null;

  const fallbackUrl = video?.rawVideoUrl
    ? (video.rawVideoUrl.startsWith('http') ? video.rawVideoUrl : BACKEND_URL + video.rawVideoUrl)
    : null;

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (hlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((lvl, index) => ({
          index,
          height: lvl.height,
          bitrate: lvl.bitrate
        }));
        setQualities(levels);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS encountered error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              if (fallbackUrl) videoEl.src = fallbackUrl;
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl') && hlsUrl) {
      videoEl.src = hlsUrl;
    } else if (fallbackUrl) {
      videoEl.src = fallbackUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, fallbackUrl]);

  const handleTimeUpdate = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    setCurrentTime(videoEl.currentTime);

    if (videoEl.buffered.length > 0) {
      setBuffered(videoEl.buffered.end(videoEl.buffered.length - 1));
    }
  };

  const handleLoadedMetadata = () => {
    const videoEl = videoRef.current;
    if (videoEl) {
      setDuration(videoEl.duration);
    }
  };

  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const seekTime = parseFloat(e.target.value);
    videoEl.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const videoEl = videoRef.current;
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoEl) {
      videoEl.volume = newVol;
      videoEl.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (isMuted) {
      videoEl.muted = false;
      videoEl.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoEl.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSpeedChange = (speed) => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleQualityChange = (qualityIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = qualityIndex;
      setSelectedQuality(qualityIndex);
      setShowQualityMenu(false);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setIsControlsVisible(false);
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none border border-zinc-800"
    >
      <video
        ref={videoRef}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-contain cursor-pointer"
        poster={video?.thumbnailUrl ? (video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : BACKEND_URL + video.thumbnailUrl) : ''}
      />

      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
          </div>
        </div>
      )}

      <div
        className={'absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 py-3 transition-opacity duration-300 ' +
          (isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
      >
        <div className="relative flex items-center group/scrubber mb-3">
          <div
            className="absolute h-1.5 bg-zinc-600/60 rounded-full pointer-events-none"
            style={{ width: ((buffered / (duration || 1)) * 100) + '%' }}
          />
          <div
            className="absolute h-1.5 bg-red-600 rounded-full pointer-events-none"
            style={{ width: ((currentTime / (duration || 1)) * 100) + '%' }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 opacity-0 group-hover/scrubber:opacity-100 cursor-pointer accent-red-600 z-10 transition-opacity"
          />
        </div>

        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Mute / Unmute"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-red-500 cursor-pointer hidden sm:block opacity-75 hover:opacity-100"
              />
            </div>

            <div className="text-xs text-zinc-300 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                className="px-2 py-1 rounded-lg text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 bg-zinc-900 border border-zinc-700 rounded-xl py-1 shadow-2xl z-50 min-w-24">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={'w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ' +
                        (playbackRate === spd ? 'bg-red-600 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800')}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {qualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowQualityMenu(!showQualityMenu);
                    setShowSpeedMenu(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Resolution Quality"
                >
                  <Settings className="w-5 h-5 text-zinc-300 hover:text-white" />
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-10 right-0 bg-zinc-900 border border-zinc-700 rounded-xl py-1 shadow-2xl z-50 min-w-28">
                    <p className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                      Quality
                    </p>
                    <button
                      onClick={() => handleQualityChange(-1)}
                      className={'w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ' +
                        (selectedQuality === -1 ? 'bg-red-600 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800')}
                    >
                      Auto
                    </button>
                    {qualities.map((q) => (
                      <button
                        key={q.index}
                        onClick={() => handleQualityChange(q.index)}
                        className={'w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ' +
                          (selectedQuality === q.index ? 'bg-red-600 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800')}
                      >
                        {q.height ? q.height + 'p' : Math.round(q.bitrate / 1000) + 'k'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
