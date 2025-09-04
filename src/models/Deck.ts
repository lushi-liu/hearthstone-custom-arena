import mongoose from "mongoose";

const DeckSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  cardIds: [{ type: String, required: true }],
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Deck || mongoose.model("Deck", DeckSchema);
