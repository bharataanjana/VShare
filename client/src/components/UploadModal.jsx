import React, { useState } from 'react';
import { X, UploadCloud, Film, Image, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { user } = useAuth();
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file (.mp4, .mkv, .avi, .mov)');
      return;
    }
    if (!title.trim()) {
      setError('Video title is required');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setProgress(10);

      const formData = new FormData();
      formData.append('video', videoFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('tags', tags);

      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      setIsUploading(false);
      onUploadSuccess();
      onClose();
    } catch (err) {
      setIsUploading(false);
      setError(err.response?.data?.message || 'Upload failed. Please check your video format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Upload Media to VSHARE</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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
              Select Raw Video File (.mp4, .mkv, .avi, .mov) *
            </label>
            <div className="relative border-2 border-dashed border-zinc-700 hover:border-red-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-zinc-950/50">
              <input
                type="file"
                accept="video/*,.mp4,.mkv,.avi,.mov"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              {videoFile ? (
                <p className="text-sm font-semibold text-red-400 truncate">{videoFile.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-200">Click to browse or drag video here</p>
                  <p className="text-xs text-zinc-500 mt-1">Chunked transcode automatically converts to HLS</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Custom Thumbnail (Optional — auto-generated if blank)
            </label>
            <div className="relative border border-zinc-700 hover:border-zinc-500 rounded-xl p-3 text-center cursor-pointer transition-colors bg-zinc-950/30">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center gap-2">
                <Image className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300">
                  {thumbnailFile ? thumbnailFile.name : 'Upload custom poster image (.jpg, .png, .webp)'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              placeholder="Engaging video title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Description (Markdown supported)
            </label>
            <textarea
              rows="3"
              placeholder="Tell viewers what your video is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
              >
                <option value="Technology">Technology</option>
                <option value="Coding">Coding & Systems</option>
                <option value="Gaming">Gaming</option>
                <option value="Education">Education</option>
                <option value="Music">Music</option>
                <option value="Entertainment">Entertainment</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="streaming, react, tutorial"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Transcoding & Uploading pipeline...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                  style={{ width: progress + '%' }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Media...</span>
                </>
              ) : (
                <span>Publish to VSHARE</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
