import { Schema, model, models } from "mongoose";

const cardSchema = new Schema(
  {
    name: { type: String, required: true },
    mana: { type: Number, required: true },
    attack: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    rarity: {
      type: String,
      enum: [
        "Free",
        "FREE",
        "Common",
        "COMMON",
        "Rare",
        "RARE",
        "Epic",
        "EPIC",
        "Legendary",
        "LEGENDARY",
      ],
      required: true,
    },
    description: { type: String, required: true },
    tribe: { type: String, default: "" },
    type: {
      type: String,
      enum: ["Minion", "MINION", "Spell", "SPELL", "Weapon", "WEAPON"],
      required: true,
    },
    class: {
      type: String,
      enum: [
        "Neutral",
        "NEUTRAL",
        "Mage",
        "MAGE",
        "Shaman",
        "SHAMAN",
        "Warrior",
        "WARRIOR",
        "Druid",
        "DRUID",
        "Hunter",
        "HUNTER",
        "Paladin",
        "PALADIN",
        "Priest",
        "PRIEST",
        "Rogue",
        "ROGUE",
        "Warlock",
        "WARLOCK",
      ],
      required: true,
    },
    source: { type: String, default: "custom" },
    cardId: { type: String, unique: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

const Card = models.Card || model("Card", cardSchema);
export default Card;
