import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { BACKEND_URL } from '../services/api';

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/comments/video/' + videoId);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      const res = await api.post('/comments', {
        text: newComment.trim(),
        videoId
      });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete('/comments/' + commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const formatCommentDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mt-8 border-t border-zinc-800 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-bold text-white">
          Community Discussions ({comments.length})
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleAddComment} className="flex gap-3 mb-8">
          <img
            src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username}
            alt={user.username}
            className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 object-cover shrink-0"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Write a public platform response comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all pr-12"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 mb-8 text-center text-sm text-zinc-400">
          Please <a href="/login" className="text-red-400 hover:underline font-semibold">Sign in</a> to participate in the conversation.
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="py-6 text-center text-sm text-zinc-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-sm text-zinc-500">No comments yet. Be the first to share your thoughts!</div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="flex gap-3 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60 group"
            >
              <img
                src={
                  comment.authorId?.avatarUrl?.startsWith('http')
                    ? comment.authorId.avatarUrl
                    : comment.authorId?.avatarUrl
                    ? BACKEND_URL + comment.authorId.avatarUrl
                    : 'https://api.dicebear.com/7.x/bottts/svg?seed=' + (comment.authorId?.username || 'user')
                }
                alt={comment.authorId?.username || 'User'}
                className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">{comment.authorId?.username || 'Anonymous'}</span>
                    <span className="text-[11px] text-zinc-500">{formatCommentDate(comment.createdAt)}</span>
                  </div>
                  {user && user._id === comment.authorId?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 transition-opacity cursor-pointer"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-zinc-300 mt-1 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
