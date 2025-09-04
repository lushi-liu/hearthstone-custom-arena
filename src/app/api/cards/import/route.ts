import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

interface HearthstoneCard {
  id: string;
  dbfId: number;
  name: string;
  set?: string;
  type: string;
  cost?: number;
  attack?: number;
  health?: number;
  durability?: number;
  rarity?: string;
  text?: string;
  race?: string;
  cardClass?: string;
  classes?: string[];
  playerClass?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { build = "latest", set } = await req.json();

    const url = `https://api.hearthstonejson.com/v1/${build}/enUS/cards.collectible.json`;
    console.log("Fetching from:", url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error("API fetch failed:", response.status, response.statusText);
      return NextResponse.json(
        { error: `API fetch failed: ${response.statusText}` },
        { status: 500 }
      );
    }

    const apiCards = await response.json();
    console.log("Fetched cards:", apiCards.length);
    const filteredCards = set
      ? apiCards.filter((c: HearthstoneCard) => c.set === set)
      : apiCards;

    const imported = [];
    for (const apiCard of filteredCards) {
      if (!["MINION", "SPELL", "WEAPON"].includes(apiCard.type)) {
        continue;
      }

      const existing = await Card.findOne({
        cardId: apiCard.dbfId?.toString(),
      });
      if (existing) {
        continue;
      }

      // Determine card class (check cardClass, classes, playerClass, default to NEUTRAL)
      const validClasses = [
        "NEUTRAL",
        "MAGE",
        "SHAMAN",
        "WARRIOR",
        "DRUID",
        "HUNTER",
        "PALADIN",
        "PRIEST",
        "ROGUE",
        "WARLOCK",
        "Neutral",
        "Mage",
        "Shaman",
        "Warrior",
        "Druid",
        "Hunter",
        "Paladin",
        "Priest",
        "Rogue",
        "Warlock",
      ];
      let cardClass = apiCard.cardClass;
      if (
        !cardClass &&
        apiCard.classes &&
        Array.isArray(apiCard.classes) &&
        apiCard.classes.length > 0
      ) {
        cardClass = apiCard.classes[0]; // Use first class for multi-class cards
      }
      if (!cardClass && apiCard.playerClass) {
        cardClass = apiCard.playerClass; // Fallback to playerClass
      }
      cardClass =
        cardClass && validClasses.includes(cardClass) ? cardClass : "NEUTRAL";

      const cardData = {
        name: apiCard.name ?? "Unknown",
        mana: apiCard.cost ?? 0,
        attack: apiCard.type === "SPELL" ? 0 : apiCard.attack ?? 0,
        health:
          apiCard.type === "SPELL"
            ? 0
            : apiCard.health ?? apiCard.durability ?? 0,
        rarity: apiCard.rarity ?? "Common",
        description: apiCard.text ?? "",
        tribe:
          apiCard.type === "SPELL" || apiCard.type === "WEAPON"
            ? ""
            : apiCard.race ?? "",
        type: apiCard.type,
        class: cardClass,
        source: `api:${build}`,
        cardId: apiCard.dbfId?.toString() ?? `temp_${Date.now()}`,
        imageUrl: `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${apiCard.id}.png`,
      };

      try {
        const card = new Card(cardData);
        await card.save();
        imported.push(card);
      } catch (error) {
        console.error("Failed to save card:", apiCard.name, "Error");
      }
    }

    console.log("Imported cards:", imported.length);
    return NextResponse.json({ importedCount: imported.length });
  } catch (error) {
    console.error("Import error");
    return NextResponse.json(
      { error: "Failed to import cards" },
      { status: 500 }
    );
  }
}
