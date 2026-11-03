const { write } = require('./writer.js');

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
