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
