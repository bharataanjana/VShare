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
            {tab === 'videos' ? ('Videos (' + videos.length + ')') : tab}
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
