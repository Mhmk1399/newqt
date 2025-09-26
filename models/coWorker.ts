import mongoose from "mongoose";

const coWorkerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    experties: {
      type: String,
      enum: ["model", "makeUpArtist", "stylist", "location", "photoGrapher"],
    },
    description: {
      type: String,
    },
    images: {
      main: {
        type: String,
      },
      thumbnails: [
        {
          type: String,
        },
      ],
    },
    resomeLink: {
      type: String,
    },
    socialLinks: {
      instagram: { type: String },
      x: { type: String },
      telegram: { type: String },
      whatsapp: { type: String },
    },
    aprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isApprove: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
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
export default mongoose.models.CoWorker ||
  mongoose.model("CoWorker", coWorkerSchema);
