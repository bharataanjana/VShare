import express from 'express';
import Video from '../models/Video.js';
import User from '../models/User.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { uploadMedia } from '../middleware/upload.js';
import { transcodeToHLS, generateThumbnail } from '../services/transcoder.js';
import path from 'path';

const router = express.Router();

// GET /api/videos - public feed with search, category, and tag filters
router.get('/', async (req, res) => {
  try {
    const { search, category, tag, creator, sort } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (creator) {
      query.creatorId = creator;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'views') {
      sortOption = { viewsCount: -1 };
    } else if (sort === 'likes') {
      sortOption = { likesCount: -1 };
    }

    const videos = await Video.find(query)
      .populate('creatorId', 'username avatarUrl subscribersCount')
      .sort(sortOption)
      .limit(50);

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/videos/trending
router.get('/trending', async (req, res) => {
  try {
    const videos = await Video.find({ status: 'ready' })
      .populate('creatorId', 'username avatarUrl subscribersCount')
      .sort({ viewsCount: -1, likesCount: -1 })
      .limit(20);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/videos/:id - get single video & increment view count
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('creatorId', 'username avatarUrl subscribersCount bio channelBanner');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment view count asynchronously
    video.viewsCount += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/videos/upload - chunked/standard video upload + transcoding pipeline
router.post(
  '/upload',
  protect,
  uploadMedia.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!req.files || !req.files['video']) {
        return res.status(400).json({ message: 'Raw media video file is required' });
      }

      const videoFile = req.files['video'][0];
      const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

      const { title, description, category, tags } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Video title is required' });
      }

      const rawVideoUrl = `/${videoFile.path.replace(/\\/g, '/')}`;
      let thumbnailUrl = thumbnailFile ? `/${thumbnailFile.path.replace(/\\/g, '/')}` : '';

      // Parse tags
      let parsedTags = [];
      if (tags) {
        if (Array.isArray(tags)) {
          parsedTags = tags;
        } else if (typeof tags === 'string') {
          parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      // If no thumbnail provided, generate one from video
      if (!thumbnailUrl) {
        const thumbName = `thumb_${path.parse(videoFile.filename).name}.jpg`;
        thumbnailUrl = `/uploads/thumbnails/${thumbName}`;
        generateThumbnail(videoFile.path, 'uploads/thumbnails', thumbName);
      }

      // Create initial video document
      const video = await Video.create({
        title,
        description: description || '',
        thumbnailUrl,
        rawVideoUrl,
        creatorId: req.user._id,
        category: category || 'Technology',
        tags: parsedTags,
        status: 'processing'
      });

      // Kick off background HLS transcode worker
      transcodeToHLS(videoFile.path, video._id).catch((err) => {
        console.error('[Transcode Worker Error]:', err);
      });

      const populatedVideo = await Video.findById(video._id).populate('creatorId', 'username avatarUrl');

      res.status(201).json({
        message: 'Video uploaded successfully. HLS transcoding pipeline started in background.',
        video: populatedVideo
      });
    } catch (error) {
      console.error('[Upload Error]:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT /api/videos/:id - update video metadata
router.put('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this video' });
    }

    const { title, description, category, tags } = req.body;
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (category) video.category = category;
    if (tags) video.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/videos/:id - delete video
router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
