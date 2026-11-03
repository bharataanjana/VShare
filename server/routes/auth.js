import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vshare_secret_token_key_2026_super_secure', {
    expiresIn: '30d'
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatarUrl } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or Email already registered' });
    }

    const user = await User.create({
      username,
      email,
      password,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      subscribersCount: user.subscribersCount,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        subscribersCount: user.subscribersCount,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    avatarUrl: req.user.avatarUrl,
    bio: req.user.bio,
    subscribersCount: req.user.subscribersCount,
    createdAt: req.user.createdAt
  });
});

export default router;
