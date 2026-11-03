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
