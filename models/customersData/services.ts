import mongoose from "mongoose";
import { IService } from "@/types/models";

const serviceSchema = new mongoose.Schema<IService>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVip: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Service =
  mongoose.models.Service || mongoose.model<IService>("Service", serviceSchema);

export default Service;
