import mongoose from "mongoose";
import { IServiceRequest } from "@/types/models";

const serviceRequestSchema = new mongoose.Schema<IServiceRequest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "in-progress", "completed", "cancelled"],
      default: "pending",
      required: true,
    },
    requestedDate: {
      type: Date,
      required: true,
    },
    scheduledDate: {
      type: Date,
    },
    requirements: {
      type: String, // JSON string of dynamic field values
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    asiginedto: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRequest =
  mongoose.models.ServiceRequest ||
  mongoose.model<IServiceRequest>("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;
