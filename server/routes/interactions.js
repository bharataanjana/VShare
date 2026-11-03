import express from 'express';
import Interaction from '../models/Interaction.js';
import Video from '../models/Video.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/interactions/:videoId
router.post('/:videoId', protect, async (req, res) => {
  try {
    const { type } = req.body; // 'like' or 'dislike'
    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Type must be like or dislike' });
    }

    const videoId = req.params.videoId;
    const userId = req.user._id;

    const existing = await Interaction.findOne({ userId, videoId });

    if (existing) {
      if (existing.type === type) {
        // Remove interaction
        await Interaction.findByIdAndDelete(existing._id);
        if (type === 'like') {
          await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } });
        } else {
          await Video.findByIdAndUpdate(videoId, { $inc: { dislikesCount: -1 } });
        }
        const updated = await Video.findById(videoId);
        return res.json({ userInteraction: null, likesCount: updated.likesCount, dislikesCount: updated.dislikesCount });
      } else {
        // Toggle from like to dislike or vice versa
        existing.type = type;
        await existing.save();

        if (type === 'like') {
          await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1, dislikesCount: -1 } });
        } else {
          await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1, dislikesCount: 1 } });
        }
        const updated = await Video.findById(videoId);
        return res.json({ userInteraction: type, likesCount: updated.likesCount, dislikesCount: updated.dislikesCount });
      }
    } else {
      // Create new interaction
      await Interaction.create({ userId, videoId, type });
      if (type === 'like') {
        await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } });
      } else {
        await Video.findByIdAndUpdate(videoId, { $inc: { dislikesCount: 1 } });
      }
      const updated = await Video.findById(videoId);
      return res.json({ userInteraction: type, likesCount: updated.likesCount, dislikesCount: updated.dislikesCount });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/interactions/:videoId/status
router.get('/:videoId/status', optionalAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    let userInteraction = null;
    if (req.user) {
      const existing = await Interaction.findOne({ userId: req.user._id, videoId: req.params.videoId });
      if (existing) userInteraction = existing.type;
    }

    res.json({
      userInteraction,
      likesCount: video.likesCount,
      dislikesCount: video.dislikesCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
