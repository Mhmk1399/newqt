import mongoose from "mongoose";

export interface ITask {
  _id: mongoose.Types.ObjectId;
  serviceRequestId: mongoose.Types.ObjectId;
  assignedTeamId?: mongoose.Types.ObjectId;
  assignedUserId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled' | 'accepted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  notes: string;
  deliverables: string;
  attachedVideo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema<ITask>({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  assignedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review',"accepted", 'completed', 'cancelled'],
    default: 'todo',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  deliverables: {
    type: String,
    default: '',
    trim: true
  },
  attachedVideo: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);

export default Task;
