import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

subscriptionSchema.index({ subscriberId: 1, creatorId: 1 }, { unique: true });

export default mongoose.model('Subscription', subscriptionSchema);
