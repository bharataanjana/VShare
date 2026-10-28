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
