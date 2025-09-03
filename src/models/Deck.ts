import { Schema, model, models } from "mongoose";

const deckSchema = new Schema(
  {
    name: { type: String, required: true },
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
    cards: [{ type: Schema.Types.ObjectId, ref: "Card" }],
  },
  { timestamps: true }
);

const Deck = models.Deck || model("Deck", deckSchema);
export default Deck;
