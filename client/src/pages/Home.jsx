import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { Video } from 'lucide-react';
import api from '../services/api';

export default function Home({ onOpenUpload }) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || 'All';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryQuery);

  const categories = [
    'All',
    'Technology',
    'Coding',
    'Gaming',
    'Education',
    'Music',
    'Entertainment',
    'General'
  ];

  useEffect(() => {
    setActiveCategory(categoryQuery);
  }, [categoryQuery]);

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, activeCategory]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let url = '/videos';
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (activeCategory && activeCategory !== 'All') params.append('category', activeCategory);

      const queryString = params.toString();
      if (queryString) url += '?' + queryString;

      const res = await api.get(url);
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={'px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ' +
              (activeCategory === cat
                ? 'bg-zinc-100 text-zinc-950 shadow-md scale-105'
                : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800/80')}
          >
            {cat}
          </button>
        ))}
      </div>

      {searchQuery && (
        <div className="mb-6 flex items-center justify-between bg-zinc-900/60 border border-zinc-800 px-4 py-3 rounded-2xl">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <span>Search results for:</span>
            <span className="font-bold text-red-400">"{searchQuery}"</span>
          </div>
          <span className="text-xs text-zinc-500">{videos.length} videos found</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-900/40 rounded-2xl p-3 border border-zinc-800/50">
              <div className="aspect-video bg-zinc-800 rounded-xl mb-3" />
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-5/6" />
                  <div className="h-2 bg-zinc-800 rounded w-3/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No videos found</h3>
          <p className="text-xs text-zinc-400 mb-6">
            {searchQuery
              ? 'No media matches your search query. Try different keywords or categories.'
              : 'Be the pioneer creator! Upload raw video and launch your custom HLS stream.'}
          </p>
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            Upload First Video
          </button>
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
