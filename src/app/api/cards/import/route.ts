import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { build = "latest", set } = await req.json();

    const url = `https://api.hearthstonejson.com/v1/${build}/enUS/cards.collectible.json`;
    const response = await fetch(url);
    if (!response.ok)
      return NextResponse.json({ error: "API fetch failed" }, { status: 500 });

    const apiCards = await response.json();
    const filteredCards = set
      ? apiCards.filter((c: any) => c.set === set)
      : apiCards;

    const imported = [];
    for (const apiCard of filteredCards) {
      if (!["MINION", "SPELL", "WEAPON"].includes(apiCard.type)) continue; // Skip unsupported types

      const existing = await Card.findOne({ cardId: apiCard.dbfId });
      if (!existing) {
        const cardData = {
          name: apiCard.name,
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
          cardId: apiCard.dbfId,
          imageUrl: `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${apiCard.id}.png`,
        };
        const card = new Card(cardData);
        await card.save();
        imported.push(card);
      }
    }

    return NextResponse.json({ importedCount: imported.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to import cards" },
      { status: 500 }
    );
  }
}
