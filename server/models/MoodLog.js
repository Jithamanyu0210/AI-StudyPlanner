import mongoose from 'mongoose';

const MoodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export default mongoose.model('MoodLog', MoodLogSchema);
