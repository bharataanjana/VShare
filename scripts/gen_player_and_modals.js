const fs = require('fs');
const path = require('path');

function write(p, content) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
  console.log('Wrote:', p);
}

// 1. HlsPlayer.jsx
write('client/src/components/HlsPlayer.jsx', `
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
`);

// 2. CommentSection.jsx
write('client/src/components/CommentSection.jsx', `
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { BACKEND_URL } from '../services/api';

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/comments/video/' + videoId);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      const res = await api.post('/comments', {
        text: newComment.trim(),
        videoId
      });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete('/comments/' + commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const formatCommentDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mt-8 border-t border-zinc-800 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-bold text-white">
          Community Discussions ({comments.length})
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleAddComment} className="flex gap-3 mb-8">
          <img
            src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username}
            alt={user.username}
            className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 object-cover shrink-0"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Write a public platform response comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all pr-12"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 mb-8 text-center text-sm text-zinc-400">
          Please <a href="/login" className="text-red-400 hover:underline font-semibold">Sign in</a> to participate in the conversation.
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="py-6 text-center text-sm text-zinc-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-sm text-zinc-500">No comments yet. Be the first to share your thoughts!</div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="flex gap-3 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60 group"
            >
              <img
                src={
                  comment.authorId?.avatarUrl?.startsWith('http')
                    ? comment.authorId.avatarUrl
                    : comment.authorId?.avatarUrl
                    ? BACKEND_URL + comment.authorId.avatarUrl
                    : 'https://api.dicebear.com/7.x/bottts/svg?seed=' + (comment.authorId?.username || 'user')
                }
                alt={comment.authorId?.username || 'User'}
                className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">{comment.authorId?.username || 'Anonymous'}</span>
                    <span className="text-[11px] text-zinc-500">{formatCommentDate(comment.createdAt)}</span>
                  </div>
                  {user && user._id === comment.authorId?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 transition-opacity cursor-pointer"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-zinc-300 mt-1 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
`);

// 3. UploadModal.jsx
write('client/src/components/UploadModal.jsx', `
import React, { useState } from 'react';
import { X, UploadCloud, Film, Image, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { user } = useAuth();
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file (.mp4, .mkv, .avi, .mov)');
      return;
    }
    if (!title.trim()) {
      setError('Video title is required');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setProgress(10);

      const formData = new FormData();
      formData.append('video', videoFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('tags', tags);

      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      setIsUploading(false);
      onUploadSuccess();
      onClose();
    } catch (err) {
      setIsUploading(false);
      setError(err.response?.data?.message || 'Upload failed. Please check your video format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Upload Media to VSHARE</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Select Raw Video File (.mp4, .mkv, .avi, .mov) *
            </label>
            <div className="relative border-2 border-dashed border-zinc-700 hover:border-red-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-zinc-950/50">
              <input
                type="file"
                accept="video/*,.mp4,.mkv,.avi,.mov"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              {videoFile ? (
                <p className="text-sm font-semibold text-red-400 truncate">{videoFile.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-200">Click to browse or drag video here</p>
                  <p className="text-xs text-zinc-500 mt-1">Chunked transcode automatically converts to HLS</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Custom Thumbnail (Optional — auto-generated if blank)
            </label>
            <div className="relative border border-zinc-700 hover:border-zinc-500 rounded-xl p-3 text-center cursor-pointer transition-colors bg-zinc-950/30">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center gap-2">
                <Image className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300">
                  {thumbnailFile ? thumbnailFile.name : 'Upload custom poster image (.jpg, .png, .webp)'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              placeholder="Engaging video title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Description (Markdown supported)
            </label>
            <textarea
              rows="3"
              placeholder="Tell viewers what your video is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
              >
                <option value="Technology">Technology</option>
                <option value="Coding">Coding & Systems</option>
                <option value="Gaming">Gaming</option>
                <option value="Education">Education</option>
                <option value="Music">Music</option>
                <option value="Entertainment">Entertainment</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="streaming, react, tutorial"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Transcoding & Uploading pipeline...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                  style={{ width: progress + '%' }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Media...</span>
                </>
              ) : (
                <span>Publish to VSHARE</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`);
