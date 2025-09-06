import mongoose from "mongoose";

const CardSchema = new mongoose.Schema({
  cardId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mana: { type: Number, required: true },
  attack: { type: Number, default: 0 },
  health: { type: Number, default: 0 },
  rarity: { type: String, default: "Common" },
  description: { type: String, default: "" },
  tribe: { type: String, default: "" },
  type: { type: String, required: true },
  class: { type: String, required: true },
  source: { type: String, required: true },
  imageUrl: { type: String },
});

export default mongoose.models.Card || mongoose.model("Card", CardSchema);
