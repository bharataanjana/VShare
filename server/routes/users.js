import express from 'express';
import User from '../models/User.js';
import Video from '../models/Video.js';
import Watchlist from '../models/Watchlist.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/channel/:id - creator channel details & videos
router.get('/channel/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Channel not found' });

    const videos = await Video.find({ creatorId: user._id }).sort({ createdAt: -1 });

    res.json({
      channel: user,
      videos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/profile - update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { bio, avatarUrl, channelBanner } = req.body;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (channelBanner) user.channelBanner = channelBanner;

    await user.save();
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      channelBanner: user.channelBanner,
      bio: user.bio,
      subscribersCount: user.subscribersCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/watchlist - get saved videos
router.get('/watchlist', protect, async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.user._id })
      .populate({
        path: 'videoId',
        populate: { path: 'creatorId', select: 'username avatarUrl subscribersCount' }
      })
      .sort({ createdAt: -1 });

    const videos = items.map((i) => i.videoId).filter(Boolean);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/watchlist/:videoId - toggle watchlist
router.post('/watchlist/:videoId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const videoId = req.params.videoId;

    const existing = await Watchlist.findOne({ userId, videoId });
    if (existing) {
      await Watchlist.findByIdAndDelete(existing._id);
      return res.json({ saved: false });
    } else {
      await Watchlist.create({ userId, videoId });
      return res.json({ saved: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/watchlist/status/:videoId
router.get('/watchlist/status/:videoId', protect, async (req, res) => {
  try {
    const existing = await Watchlist.findOne({ userId: req.user._id, videoId: req.params.videoId });
    res.json({ saved: !!existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
