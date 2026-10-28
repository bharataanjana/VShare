const { write } = require('./writer.js');

write('server/seed.js', `
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Video from './models/Video.js';
import Comment from './models/Comment.js';
import Subscription from './models/Subscription.js';
import Interaction from './models/Interaction.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vshare', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('[Seed] Connected to MongoDB');

    await User.deleteMany({});
    await Video.deleteMany({});
    await Comment.deleteMany({});
    await Subscription.deleteMany({});
    await Interaction.deleteMany({});

    console.log('[Seed] Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const userBharat = await User.create({
      username: 'bharat_anjana',
      email: 'bharat@vshare.io',
      password: 'password123',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Lead Systems Engineer & Cloud Streaming Architect at VSHARE.',
      subscribersCount: 2
    });

    const userSiddhi = await User.create({
      username: 'siddhi_patel',
      email: 'siddhi@vshare.io',
      password: 'password123',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      bio: 'Internal Systems Guide & Full-Stack Tech Mentor.',
      subscribersCount: 1
    });

    const userAlex = await User.create({
      username: 'alex_codes',
      email: 'alex@vshare.io',
      password: 'password123',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bio: 'Web engineering tutorials, React 19, FFmpeg streams, and distributed systems.',
      subscribersCount: 1
    });

    const sampleVideos = [
      {
        title: 'Building VSHARE: High-Performance HLS Video Delivery & Transcoding Pipeline',
        description: 'Deep dive into adaptive bitrate streaming, FFmpeg chunking (.m3u8 playlists, .ts slices), Node.js worker threads, and low-latency custom HTML5 players.\\n\\nIn this video we cover:\\n1. HLS Architecture\\n2. Express.js REST API\\n3. React 19 Custom Video Player UI',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&auto=format&fit=crop&q=80',
        rawVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        masterM3U8: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        creatorId: userBharat._id,
        viewsCount: 142300,
        likesCount: 12400,
        dislikesCount: 21,
        tags: ['streaming', 'ffmpeg', 'hls', 'react19', 'nodejs'],
        category: 'Technology',
        status: 'ready'
      },
      {
        title: 'Full-Stack React 19 & Tailwind CSS Masterclass: Component Design & State Channels',
        description: 'Explore the modern frontend component architecture for media dashboards, custom sliders, responsive sidebars, and reactive UI state handling in React 19.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1280&auto=format&fit=crop&q=80',
        rawVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        masterM3U8: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        creatorId: userAlex._id,
        viewsCount: 89120,
        likesCount: 7820,
        dislikesCount: 14,
        tags: ['react', 'tailwindcss', 'javascript', 'frontend'],
        category: 'Coding',
        status: 'ready'
      },
      {
        title: 'Distributed System Architecture: Microservices, Caching, and Video Transcoding Workers',
        description: 'How to scale video platforms horizontally using asynchronous message queues, cloud storage clusters, and stateless authentication tokens.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&auto=format&fit=crop&q=80',
        rawVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        masterM3U8: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        creatorId: userBharat._id,
        viewsCount: 231500,
        likesCount: 19800,
        dislikesCount: 35,
        tags: ['architecture', 'microservices', 'devops', 'backend'],
        category: 'Technology',
        status: 'ready'
      },
      {
        title: 'Next-Gen Game Engine Graphics & Real-Time Raytracing Demystified',
        description: 'An overview of shaders, GPU compute pipelines, and how modern gaming engines achieve hyper-realistic lighting in real time.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&auto=format&fit=crop&q=80',
        rawVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        masterM3U8: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        creatorId: userSiddhi._id,
        viewsCount: 65400,
        likesCount: 5400,
        dislikesCount: 8,
        tags: ['gaming', 'graphics', 'unreal', 'raytracing'],
        category: 'Gaming',
        status: 'ready'
      }
    ];

    const createdVideos = await Video.insertMany(sampleVideos);
    console.log('[Seed] Created ' + createdVideos.length + ' initial videos');

    await Comment.create([
      {
        text: 'Incredible breakdown of HLS adaptive streaming! The custom player controls with speed switcher are super smooth.',
        authorId: userSiddhi._id,
        videoId: createdVideos[0]._id
      },
      {
        text: 'The FFmpeg multi-resolution pipeline is clean. Loving the dark UI!',
        authorId: userAlex._id,
        videoId: createdVideos[0]._id
      },
      {
        text: 'React 19 with Tailwind makes building these interfaces so fast and modular.',
        authorId: userBharat._id,
        videoId: createdVideos[1]._id
      }
    ]);

    await Subscription.create([
      { subscriberId: userBharat._id, creatorId: userAlex._id },
      { subscriberId: userAlex._id, creatorId: userBharat._id },
      { subscriberId: userSiddhi._id, creatorId: userBharat._id }
    ]);

    console.log('[Seed] Database successfully seeded with sample demo creators and videos!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
};

seedData();
`);
