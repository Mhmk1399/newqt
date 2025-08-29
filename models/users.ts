import mongoose from "mongoose";
import { IUser } from "@/types/models";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
   role: {
      type: String,
      enum: ["admin", "manager","editor","designer",'video-shooter'],
      default: "designer",
  },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    permissions: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

},{
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
