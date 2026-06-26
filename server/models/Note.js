import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export default mongoose.model('Note', NoteSchema);
