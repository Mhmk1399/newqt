import mongoose from "mongoose";
import { ICustomer } from "@/types/models";

const customerSchema = new mongoose.Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    businessScale: {
      type: String,
      enum: ["startup", "small", "medium", "large", "enterprise"],
    },
    address: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    isVip: {
      type: Boolean,
      default: false,
    }
    
  },
  {
    timestamps: true,
  }
);

const Customer =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
