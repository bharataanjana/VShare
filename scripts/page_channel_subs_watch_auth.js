const { write } = require('./writer.js');

write('client/src/pages/Channel.jsx', `
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { Edit3, Trash2, CheckCircle2, Video, Eye, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Channel({ onOpenUpload }) {
  const { id } = useParams();
  const { user, updateUser } = useAuth();

  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isOwner = user && user._id === id;

  useEffect(() => {
    fetchChannel();
  }, [id]);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/channel/' + id);
      setChannelData(res.data.channel);
      setVideos(res.data.videos);
      setBioInput(res.data.channel?.bio || '');

      if (user && !isOwner) {
        const subRes = await api.get('/subscriptions/status/' + id);
        setIsSubscribed(subRes.data.subscribed);
      }
    } catch (err) {
      console.error('Failed to load channel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!user) return alert('Please sign in to subscribe');
    try {
      const res = await api.post('/subscriptions/toggle/' + id);
      setIsSubscribed(res.data.subscribed);
      setChannelData((prev) => ({ ...prev, subscribersCount: res.data.subscribersCount }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error subscribing');
    }
  };

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', { bio: bioInput });
      setChannelData((prev) => ({ ...prev, bio: res.data.bio }));
      updateUser({ bio: res.data.bio });
      setIsEditingProfile(false);
    } catch (err) {
      alert('Failed to update bio');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete('/videos/' + videoId);
      setVideos(videos.filter((v) => v._id !== videoId));
    } catch (err) {
      alert('Failed to delete video');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="flex-1 p-10 text-center text-zinc-400">
        <p className="text-lg font-bold text-white">Channel Not Found</p>
      </div>
    );
  }

  const totalViews = videos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.likesCount || 0), 0);

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      <div className="relative h-44 sm:h-56 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-red-950/40 border border-zinc-800 overflow-hidden mb-6 flex items-end p-6">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <img
              src={
                channelData.avatarUrl ||
                'https://api.dicebear.com/7.x/bottts/svg?seed=' + channelData.username
              }
              alt={channelData.username}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-zinc-950 bg-zinc-800 object-cover shadow-2xl"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{channelData.username}</span>
                <CheckCircle2 className="w-5 h-5 text-red-500" />
              </h1>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                {channelData.subscribersCount || 0} subscribers • {videos.length} videos
              </p>
            </div>
          </div>

          <div>
            {isOwner ? (
              <button
                onClick={onOpenUpload}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                Upload to Channel
              </button>
            ) : (
              <button
                onClick={handleToggleSubscribe}
                className={'px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ' +
                  (isSubscribed
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30')}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-zinc-800 pb-3 mb-6">
        {['videos', 'analytics', 'about'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={'text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ' +
              (activeTab === tab ? 'text-red-500 border-b-2 border-red-500 pb-3 -mb-3.5' : 'text-zinc-400 hover:text-white')}
          >
            {tab === 'videos' ? `Videos (${videos.length})` : tab}
          </button>
        ))}
      </div>

      {activeTab === 'videos' && (
        <div>
          {videos.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
              <p className="text-sm text-zinc-400">No videos published on this channel yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {videos.map((video) => (
                <div key={video._id} className="relative group/edit">
                  <VideoCard video={{ ...video, creatorId: channelData }} />
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteVideo(video._id)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white opacity-0 group-hover/edit:opacity-100 transition-opacity shadow-lg cursor-pointer"
                      title="Delete video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-2">
              <Eye className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Video Views</span>
            </div>
            <p className="text-3xl font-black text-white">{totalViews.toLocaleString()}</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-2">
              <ThumbsUp className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Likes</span>
            </div>
            <p className="text-3xl font-black text-white">{totalLikes.toLocaleString()}</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-blue-400 mb-2">
              <Video className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Published Videos</span>
            </div>
            <p className="text-3xl font-black text-white">{videos.length}</p>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Creator Bio</h3>
            {isOwner && !isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Bio</span>
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleUpdateBio} className="space-y-3">
              <textarea
                rows="4"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer"
                >
                  Save Bio
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {channelData.bio || 'No channel description provided.'}
            </p>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
            <span>Channel registered: </span>
            <span>{new Date(channelData.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
`);

write('client/src/pages/SubscriptionsPage.jsx', `
import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { Users, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubFeed();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubFeed = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/feed');
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to load sub feed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 p-10 text-center text-zinc-400">
        <Compass className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Subscriptions Feed</h2>
        <p className="text-xs text-zinc-500 mb-4">Sign in to view new releases from your favorite creators.</p>
        <a href="/login" className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-semibold">
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2.5 mb-6">
        <Users className="w-6 h-6 text-red-500" />
        <h1 className="text-xl font-bold text-white">Subscribed Channels Feed</h1>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-500">Loading subscribed videos...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
          <p className="text-sm text-zinc-400">No new videos from your subscribed channels yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
`);

write('client/src/pages/WatchlistPage.jsx', `
import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { Bookmark, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function WatchlistPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/watchlist');
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 p-10 text-center text-zinc-400">
        <Bookmark className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Your Watchlist</h2>
        <p className="text-xs text-zinc-500 mb-4">Sign in to view saved videos and queues.</p>
        <a href="/login" className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-semibold">
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2.5 mb-6">
        <Bookmark className="w-6 h-6 text-amber-500" />
        <h1 className="text-xl font-bold text-white">Your Saved Watchlist ({videos.length})</h1>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-500">Loading saved media...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
          <Film className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">Your watchlist is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
`);

write('client/src/pages/Login.jsx', `
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/70 border border-zinc-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/20">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="text-xs text-zinc-400 mt-1">Sign in to your VSHARE creator account</p>
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
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
              <input
                type="email"
                placeholder="creator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-red-400 font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
`);

write('client/src/pages/Register.jsx', `
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/70 border border-zinc-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/20">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
          <h1 className="text-2xl font-black text-white">Create Account</h1>
          <p className="text-xs text-zinc-400 mt-1">Join the VSHARE creator streaming community</p>
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
              Creator Username
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5" />
              <input
                type="text"
                placeholder="bharat_systems"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
              <input
                type="email"
                placeholder="bharat@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Password (min 6 chars)
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Creating Channel...' : 'Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-red-400 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
`);

write('client/src/App.jsx', `
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Channel from './pages/Channel';
import SubscriptionsPage from './pages/SubscriptionsPage';
import WatchlistPage from './pages/WatchlistPage';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenUpload = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setIsUploadOpen(true);
  };

  const handleUploadSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-red-500 selection:text-white">
      <Navbar onOpenUpload={handleOpenUpload} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />

        <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          <Routes>
            <Route path="/" element={<Home onOpenUpload={handleOpenUpload} />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/channel/:id" element={<Channel onOpenUpload={handleOpenUpload} />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
`);

write('client/src/main.jsx', `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
`);
