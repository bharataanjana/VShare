import express from 'express';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Video from '../models/Video.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/subscriptions/toggle/:creatorId
router.post('/toggle/:creatorId', protect, async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const subscriberId = req.user._id;

    if (creatorId.toString() === subscriberId.toString()) {
      return res.status(400).json({ message: 'You cannot subscribe to your own channel' });
    }

    const existing = await Subscription.findOne({ subscriberId, creatorId });

    if (existing) {
      await Subscription.findByIdAndDelete(existing._id);
      await User.findByIdAndUpdate(creatorId, { $inc: { subscribersCount: -1 } });
      const updatedCreator = await User.findById(creatorId);
      return res.json({ subscribed: false, subscribersCount: updatedCreator.subscribersCount });
    } else {
      await Subscription.create({ subscriberId, creatorId });
      await User.findByIdAndUpdate(creatorId, { $inc: { subscribersCount: 1 } });
      const updatedCreator = await User.findById(creatorId);
      return res.json({ subscribed: true, subscribersCount: updatedCreator.subscribersCount });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/subscriptions/status/:creatorId
router.get('/status/:creatorId', protect, async (req, res) => {
  try {
    const existing = await Subscription.findOne({
      subscriberId: req.user._id,
      creatorId: req.params.creatorId
    });
    res.json({ subscribed: !!existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/subscriptions/feed - get videos from subscribed channels
router.get('/feed', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ subscriberId: req.user._id });
    const creatorIds = subscriptions.map((s) => s.creatorId);

    const videos = await Video.find({ creatorId: { $in: creatorIds } })
      .populate('creatorId', 'username avatarUrl subscribersCount')
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/subscriptions/channels - list subscribed creators
router.get('/channels', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ subscriberId: req.user._id })
      .populate('creatorId', 'username avatarUrl subscribersCount bio');
    res.json(subscriptions.map(s => s.creatorId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
