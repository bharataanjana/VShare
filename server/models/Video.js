import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail is required']
  },
  masterM3U8: {
    type: String,
    default: ''
  },
  rawVideoUrl: {
    type: String,
    default: ''
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  dislikesCount: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: 'Technology'
  },
  duration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Video', videoSchema);
