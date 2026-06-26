import mongoose from 'mongoose';

const WeekendTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  done: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('WeekendTask', WeekendTaskSchema);
