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
