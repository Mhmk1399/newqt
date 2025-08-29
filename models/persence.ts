import mongoose from "mongoose";

const presenceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startHour: { type: String, required: true },
  endHour: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.models.Presence ||
  mongoose.model("Presence", presenceSchema);
