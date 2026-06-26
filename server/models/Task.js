import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  deadline: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  done: { type: Boolean, default: false },
  tags: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Task', TaskSchema);
