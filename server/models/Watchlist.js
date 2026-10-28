import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

watchlistSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export default mongoose.model('Watchlist', watchlistSchema);
