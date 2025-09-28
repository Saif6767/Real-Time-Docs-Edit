import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collaborators: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
