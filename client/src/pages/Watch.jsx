import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import HlsPlayer from '../components/HlsPlayer';
import CommentSection from '../components/CommentSection';
import VideoCard from '../components/VideoCard';
import { ThumbsUp, ThumbsDown, Bookmark, Share2, Check, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { BACKEND_URL } from '../services/api';

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();

  const [video, setVideo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [interaction, setInteraction] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [isWatchlistSaved, setIsWatchlistSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVideoData();
  }, [id]);

  useEffect(() => {
    if (user && video?.creatorId?._id) {
      checkSubStatus(video.creatorId._id);
      checkInteractionStatus();
      checkWatchlistStatus();
    }
  }, [user, video]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/videos/' + id);
      setVideo(res.data);
      setLikesCount(res.data.likesCount || 0);
      setDislikesCount(res.data.dislikesCount || 0);
      setSubscribersCount(res.data.creatorId?.subscribersCount || 0);

      const recRes = await api.get('/videos?category=' + (res.data.category || 'Technology'));
      setRecommendations(recRes.data.filter((v) => v._id !== id));
    } catch (err) {
      console.error('Failed to load video:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkSubStatus = async (creatorId) => {
    try {
      const res = await api.get('/subscriptions/status/' + creatorId);
      setIsSubscribed(res.data.subscribed);
    } catch (err) {}
  };

  const checkInteractionStatus = async () => {
    try {
      const res = await api.get('/interactions/' + id + '/status');
      setInteraction(res.data.userInteraction);
      setLikesCount(res.data.likesCount);
      setDislikesCount(res.data.dislikesCount);
    } catch (err) {}
  };

  const checkWatchlistStatus = async () => {
    try {
      const res = await api.get('/users/watchlist/status/' + id);
      setIsWatchlistSaved(res.data.saved);
    } catch (err) {}
  };

  const handleToggleSubscribe = async () => {
    if (!user) return alert('Please sign in to subscribe to creators');
    try {
      const res = await api.post('/subscriptions/toggle/' + video.creatorId._id);
      setIsSubscribed(res.data.subscribed);
      setSubscribersCount(res.data.subscribersCount);
    } catch (err) {
      alert(err.response?.data?.message || 'Subscription failed');
    }
  };

  const handleInteraction = async (type) => {
    if (!user) return alert('Please sign in to like/dislike');
    try {
      const res = await api.post('/interactions/' + id, { type });
      setInteraction(res.data.userInteraction);
      setLikesCount(res.data.likesCount);
      setDislikesCount(res.data.dislikesCount);
    } catch (err) {}
  };

  const handleToggleWatchlist = async () => {
    if (!user) return alert('Please sign in to save to your watchlist');
    try {
      const res = await api.post('/users/watchlist/' + id);
      setIsWatchlistSaved(res.data.saved);
    } catch (err) {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex-1 p-10 text-center text-zinc-400">
        <p className="text-lg font-bold text-white mb-2">Video Unavailable</p>
        <p className="text-sm">The video may have been deleted or is still processing.</p>
        <Link to="/" className="inline-block mt-4 text-xs font-semibold text-red-400 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const creatorAvatar = video.creatorId?.avatarUrl?.startsWith('http')
    ? video.creatorId.avatarUrl
    : video.creatorId?.avatarUrl
    ? BACKEND_URL + video.creatorId.avatarUrl
    : 'https://api.dicebear.com/7.x/bottts/svg?seed=' + (video.creatorId?.username || 'creator');

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HlsPlayer video={video} />

          <div className="mt-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {video.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <Link to={'/channel/' + video.creatorId?._id}>
                  <img
                    src={creatorAvatar}
                    alt={video.creatorId?.username}
                    className="w-11 h-11 rounded-full border border-zinc-700 object-cover bg-zinc-800"
                  />
                </Link>
                <div>
                  <Link
                    to={'/channel/' + video.creatorId?._id}
                    className="text-sm font-bold text-white hover:text-red-400 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{video.creatorId?.username}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  </Link>
                  <p className="text-xs text-zinc-400 font-medium">
                    {subscribersCount} subscribers
                  </p>
                </div>

                {user && user._id !== video.creatorId?._id && (
                  <button
                    onClick={handleToggleSubscribe}
                    className={'ml-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ' +
                      (isSubscribed
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                        : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-md shadow-red-600/30')}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5">
                  <button
                    onClick={() => handleInteraction('like')}
                    className={'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ' +
                      (interaction === 'like' ? 'text-red-400 bg-zinc-800' : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60')}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{likesCount}</span>
                  </button>
                  <div className="w-[1px] h-4 bg-zinc-800" />
                  <button
                    onClick={() => handleInteraction('dislike')}
                    className={'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ' +
                      (interaction === 'dislike' ? 'text-blue-400 bg-zinc-800' : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60')}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{dislikesCount > 0 ? dislikesCount : ''}</span>
                  </button>
                </div>

                <button
                  onClick={handleToggleWatchlist}
                  className={'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ' +
                    (isWatchlistSaved
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800')}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isWatchlistSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-xs">
              <div className="flex items-center gap-3 font-semibold text-zinc-300 mb-2">
                <span>{video.viewsCount?.toLocaleString()} views</span>
                <span>•</span>
                <span>{new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                {video.category && (
                  <>
                    <span>•</span>
                    <span className="text-red-400 font-bold">#{video.category}</span>
                  </>
                )}
              </div>

              <p className={'text-zinc-300 whitespace-pre-wrap leading-relaxed ' + (!isDescExpanded ? 'line-clamp-3' : '')}>
                {video.description || 'No description provided for this video.'}
              </p>

              {video.tags && video.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {video.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 text-[11px]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {video.description && video.description.length > 150 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-2 text-zinc-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>{isDescExpanded ? 'Show less' : 'Show more'}</span>
                  {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <CommentSection videoId={video._id} />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-white uppercase tracking-wider">Up Next</p>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <VideoCard key={rec._id} video={rec} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
