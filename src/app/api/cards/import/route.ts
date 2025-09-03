import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

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
      ? apiCards.filter((c: any) => c.set === set)
      : apiCards;

    const imported = [];
    const skipped = [];
    for (const apiCard of filteredCards) {
      if (!["MINION", "SPELL", "WEAPON"].includes(apiCard.type)) {
        console.log(
          "Skipping card due to unsupported type:",
          apiCard.name,
          apiCard.type
        );
        skipped.push({
          name: apiCard.name,
          reason: `Unsupported type: ${apiCard.type}`,
        });
        continue;
      }

      const existing = await Card.findOne({
        cardId: apiCard.dbfId?.toString(),
      });
      if (existing) {
        console.log(
          "Skipping card due to existing dbfId:",
          apiCard.name,
          apiCard.dbfId
        );
        skipped.push({ name: apiCard.name, reason: "Already exists" });
        continue;
      }

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
        class: apiCard.cardClass ?? "Neutral",
        source: `api:${build}`,
        cardId: apiCard.dbfId?.toString() ?? `temp_${Date.now()}`,
        imageUrl: `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${apiCard.id}.png`,
      };

      try {
        const card = new Card(cardData);
        await card.save();
        imported.push(card);
      } catch (error: any) {
        console.error("Failed to save card:", apiCard.name, error.message);
        skipped.push({
          name: apiCard.name,
          reason: `Validation error: ${error.message}`,
        });
      }
    }

    console.log("Skipped cards:", skipped.length, "Skipped:", skipped);
    return NextResponse.json({
      importedCount: imported.length,
      skippedCount: skipped.length,
    });
  } catch (error: any) {
    console.error("Import error:", error.message, error.stack);
    return NextResponse.json(
      { error: `Failed to import cards: ${error.message}` },
      { status: 500 }
    );
  }
}
