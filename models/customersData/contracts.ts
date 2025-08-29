import mongoose from "mongoose";
import { IContract } from "../../types/models";
import Customer from "./customers";

const contractSchema = new mongoose.Schema<IContract>(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Customer,
      required: true,
    },
    contractNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "terminated", "expired"],
      default: "draft",
      required: true,
    },
    signedDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    terms: {
      type: String,
    },
    verifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    contractType: {
      type: String,
      enum: ["standard", "premium", "enterprise", "custom"],
      required: true,
      default: "standard",
    },
  },
  {
    timestamps: true,
  }
);

const Contract =
  mongoose.models.Contract ||
  mongoose.model<IContract>("Contract", contractSchema);

export default Contract;
