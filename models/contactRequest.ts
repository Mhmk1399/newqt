import mongoose from "mongoose";

const contactRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['content', 'photo', 'video', 'social'],
    default: 'content'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.contactRequest ||
  mongoose.model("contactRequest", contactRequestSchema);
