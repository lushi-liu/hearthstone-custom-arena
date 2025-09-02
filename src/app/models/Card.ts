import { Schema, model, models } from "mongoose";

const cardSchema = new Schema(
  {
    name: { type: String, required: true },
    mana: { type: Number, required: true },
    attack: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    rarity: {
      type: String,
      enum: ["Free", "Common", "Rare", "Epic", "Legendary"],
      required: true,
    },
    description: { type: String, required: true },
    tribe: { type: String, default: "" },
    source: { type: String, default: "custom" }, // 'custom' or 'api:<build>' for later API imports
    cardId: { type: String, unique: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

const Card = models.Card || model("Card", cardSchema);
export default Card;
