import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    subject: { type: String, required: true },
    paid: { type: Number, required: true, default: 0 },
    received: { type: Number, required: true, default: 0 },
    users: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
