import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const deckClass = searchParams.get("class") || "Neutral";
    const seed = parseInt(searchParams.get("seed") || "0");
    const limit = parseInt(searchParams.get("limit") || "3"); // Support limit for home page

    // Rarity probabilities
    const rarityRoll = Math.random() * 100;
    let rarity: string;
    if (rarityRoll < 1) rarity = "Legendary";
    else if (rarityRoll < 8) rarity = "Epic";
    else if (rarityRoll < 30) rarity = "Rare";
    else rarity = "Common";

    // Fetch cards
    const cards = await Card.aggregate([
      {
        $match: {
          rarity: { $in: [rarity, rarity.toUpperCase()] },
          class: {
            $in: [deckClass, deckClass.toUpperCase(), "Neutral", "NEUTRAL"],
          },
        },
      },
      { $sample: { size: 6 } },
    ]);

    // Remove duplicates by cardId
    const uniqueCards = [];
    const seenCardIds = new Set();
    for (const card of cards) {
      const cardId = card.cardId.toString(); // Ensure string
      if (!seenCardIds.has(cardId)) {
        uniqueCards.push({ ...card, cardId });
        seenCardIds.add(cardId);
      }
      if (uniqueCards.length === limit) break;
    }

    if (uniqueCards.length < limit) {
      console.error("Not enough unique cards:", {
        deckClass,
        rarity,
        available: cards.length,
      });
      return NextResponse.json(
        { error: "Not enough unique cards available" },
        { status: 400 }
      );
    }

    console.log(
      "Fetched cards for class:",
      deckClass,
      "rarity:",
      rarity,
      "cards:",
      uniqueCards.map((c) => ({ name: c.name, cardId: c.cardId }))
    );

    return NextResponse.json(uniqueCards);
  } catch (error) {
    console.error("Random cards error");
    return NextResponse.json(
      { error: "Failed to fetch random cards" },
      { status: 500 }
    );
  }
}
