import mongoose from "mongoose";

export interface ITeam {
  _id: mongoose.Types.ObjectId;
  name: string;
  specialization: string;
  description: string;
  isActive: boolean;
  amount: Number;
}

const teamSchema = new mongoose.Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Team = mongoose.models.Team || mongoose.model<ITeam>("Team", teamSchema);

export default Team;
