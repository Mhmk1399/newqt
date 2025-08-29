import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  subject: { type: String, required: true },
  debtor: { type: Number, required: true },
  fastener: { type: Number, required: true },
  users: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
