import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  day: { type: String, required: true },
  color: { type: String, default: '#7c3aed' }
}, { timestamps: true });

export default mongoose.model('Schedule', ScheduleSchema);
