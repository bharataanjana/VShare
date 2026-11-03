const fs = require('fs');
const path = require('path');

function write(p, content) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
  console.log('Wrote:', p);
}

// 1. Navbar.jsx
write('client/src/components/Navbar.jsx', `
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Search, Video, LogOut, Bookmark, Compass, Tv } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenUpload }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/?search=' + encodeURIComponent(searchTerm.trim()));
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              VSHARE
            </span>
            <span className="text-[10px] text-red-400 font-semibold tracking-wider -mt-1 uppercase">
              HLS Stream Core
            </span>
          </div>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
        <div className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="Search videos, tags, creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/70 text-zinc-100 placeholder-zinc-400 text-sm rounded-full pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium text-sm px-4 py-2 rounded-full shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all transform active:scale-95 cursor-pointer"
        >
          <Video className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-zinc-700 transition-all focus:outline-none cursor-pointer"
            >
              <img
                src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username}
                alt={user.username}
                className="w-8 h-8 rounded-full border border-zinc-700 object-cover bg-zinc-800"
              />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsDropdownOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-zinc-800">
                  <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                </div>

                <Link
                  to={'/channel/' + user._id}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <Tv className="w-4 h-4 text-red-400" />
                  Your Channel & Studio
                </Link>

                <Link
                  to="/watchlist"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  Watchlist
                </Link>

                <Link
                  to="/subscriptions"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <Compass className="w-4 h-4 text-blue-400" />
                  Subscriptions
                </Link>

                <div className="border-t border-zinc-800 mt-1 pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-1.5 rounded-lg transition-colors border border-zinc-700"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
`);

// 2. Sidebar.jsx
write('client/src/components/Sidebar.jsx', `
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bookmark, Tv, Code, Gamepad2, Music, GraduationCap, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Sidebar({ isOpen }) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    if (user) {
      api.get('/subscriptions/channels')
        .then((res) => setSubscriptions(res.data))
        .catch(() => {});
    } else {
      setSubscriptions([]);
    }
  }, [user]);

  const navClass = ({ isActive }) =>
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ' +
    (isActive
      ? 'bg-red-500/10 text-red-400 border border-red-500/20 font-semibold'
      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900');

  return (
    <aside
      className={'fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-60 border-r border-zinc-800/70 bg-zinc-950 p-4 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ' +
        (isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <NavLink to="/" end className={navClass}>
            <Home className="w-4 h-4" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/subscriptions" className={navClass}>
            <Compass className="w-4 h-4" />
            <span>Subscribed</span>
          </NavLink>
          <NavLink to="/watchlist" className={navClass}>
            <Bookmark className="w-4 h-4" />
            <span>Watchlist</span>
          </NavLink>
          {user && (
            <NavLink to={'/channel/' + user._id} className={navClass}>
              <Tv className="w-4 h-4" />
              <span>Your Channel</span>
            </NavLink>
          )}
        </div>

        <div className="border-t border-zinc-800/80 pt-4">
          <p className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Explore Feeds
          </p>
          <div className="space-y-1 text-xs">
            <NavLink to="/?category=Technology" className={navClass}>
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Technology</span>
            </NavLink>
            <NavLink to="/?category=Coding" className={navClass}>
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Coding & Systems</span>
            </NavLink>
            <NavLink to="/?category=Gaming" className={navClass}>
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              <span>Gaming</span>
            </NavLink>
            <NavLink to="/?category=Education" className={navClass}>
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Education</span>
            </NavLink>
            <NavLink to="/?category=Music" className={navClass}>
              <Music className="w-4 h-4 text-pink-400" />
              <span>Music</span>
            </NavLink>
          </div>
        </div>

        {user && subscriptions.length > 0 && (
          <div className="border-t border-zinc-800/80 pt-4">
            <p className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Subscriptions ({subscriptions.length})
            </p>
            <div className="space-y-1">
              {subscriptions.slice(0, 5).map((sub) => (
                <NavLink
                  key={sub._id}
                  to={'/channel/' + sub._id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:bg-zinc-900 transition-colors"
                >
                  <img
                    src={sub.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + sub.username}
                    alt={sub.username}
                    className="w-6 h-6 rounded-full border border-zinc-800 object-cover"
                  />
                  <span className="truncate text-xs font-medium">{sub.username}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800/80 pt-4 text-[11px] text-zinc-400 space-y-1 px-1">
        <p className="font-semibold text-zinc-300">VSHARE Platform v1.0</p>
        <p>Built with React 19, Node & HLS Core</p>
        <p className="text-zinc-400">Lead: Bharat Anjana</p>
      </div>
    </aside>
  );
}
`);

// 3. VideoCard.jsx
write('client/src/components/VideoCard.jsx', `
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Play } from 'lucide-react';
import { BACKEND_URL } from '../services/api';

export default function VideoCard({ video }) {
  const getThumbnailSrc = () => {
    if (!video.thumbnailUrl) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
    if (video.thumbnailUrl.startsWith('http')) return video.thumbnailUrl;
    return BACKEND_URL + video.thumbnailUrl;
  };

  const getCreatorAvatar = () => {
    if (video.creatorId?.avatarUrl) {
      if (video.creatorId.avatarUrl.startsWith('http')) return video.creatorId.avatarUrl;
      return BACKEND_URL + video.creatorId.avatarUrl;
    }
    return 'https://api.dicebear.com/7.x/bottts/svg?seed=' + (video.creatorId?.username || 'creator');
  };

  const formatViews = (count) => {
    if (!count) return '0 views';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M views';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K views';
    return count + ' views';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'recently';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return diffDays + 'd ago';
    return d.toLocaleDateString();
  };

  return (
    <div className="group flex flex-col bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/60 hover:border-zinc-700/80 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-red-950/10">
      <Link to={'/watch/' + video._id} className="relative aspect-video w-full bg-zinc-950 overflow-hidden block">
        <img
          src={getThumbnailSrc()}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
          }}
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {video.masterM3U8 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-bold tracking-wide text-red-400 border border-red-500/30">
            HLS
          </span>
        )}

        {video.category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-zinc-300">
            {video.category}
          </span>
        )}
      </Link>

      <div className="p-3.5 flex gap-3">
        <Link to={'/channel/' + video.creatorId?._id} className="shrink-0">
          <img
            src={getCreatorAvatar()}
            alt={video.creatorId?.username || 'Creator'}
            className="w-9 h-9 rounded-full border border-zinc-700 object-cover bg-zinc-800"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={'/watch/' + video._id}>
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-red-400 line-clamp-2 leading-snug transition-colors">
              {video.title}
            </h3>
          </Link>

          <Link
            to={'/channel/' + video.creatorId?._id}
            className="text-xs text-zinc-400 hover:text-zinc-200 mt-1 flex items-center gap-1 transition-colors"
          >
            <span>{video.creatorId?.username || 'Unknown Creator'}</span>
            <CheckCircle2 className="w-3 h-3 text-red-500" />
          </Link>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1 font-medium">
            <span>{formatViews(video.viewsCount)}</span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
`);
