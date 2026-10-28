import express from 'express';
import Comment from '../models/Comment.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/comments/video/:videoId - get all comments for a video
router.get('/video/:videoId', optionalAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.videoId })
      .populate('authorId', 'username avatarUrl')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/comments - add a comment or reply
router.post('/', protect, async (req, res) => {
  try {
    const { text, videoId, parentId } = req.body;

    if (!text || !videoId) {
      return res.status(400).json({ message: 'Comment text and videoId are required' });
    }

    const comment = await Comment.create({
      text,
      videoId,
      authorId: req.user._id,
      parentId: parentId || null
    });

    const populated = await Comment.findById(comment._id).populate('authorId', 'username avatarUrl');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    // Also delete any direct replies
    await Comment.deleteMany({ parentId: req.params.id });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
