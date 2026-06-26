import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  total: { type: Number, required: true },
  category: { type: String, enum: ['short', 'long'], default: 'short' }
}, { timestamps: true });

export default mongoose.model('Goal', GoalSchema);
