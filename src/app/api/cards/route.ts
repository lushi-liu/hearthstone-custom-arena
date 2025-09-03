import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const deckClass = searchParams.get("class") || "Neutral";
    const seed = parseInt(searchParams.get("seed") || "0");

    // Rarity probabilities
    const rarityRoll = Math.random() * 100;
    let rarity: string;
    if (rarityRoll < 1) rarity = "Legendary";
    else if (rarityRoll < 8) rarity = "Epic";
    else if (rarityRoll < 30) rarity = "Rare";
    else rarity = "Common";

    const cards = await Card.aggregate([
      {
        $match: {
          rarity: { $in: [rarity, rarity.toUpperCase()] },
          class: {
            $in: [deckClass, deckClass.toUpperCase(), "Neutral", "NEUTRAL"],
          },
        },
      },
      { $sample: { size: 3 } },
    ]);

    // Remove duplicates by cardId
    /*const uniqueCards = [];
    const seenCardIds = new Set();
    for (const card of cards) {
      if (!seenCardIds.has(card.cardId)) {
        uniqueCards.push(card);
        seenCardIds.add(card.cardId);
      }
      if (uniqueCards.length === 3) break;
    }

    if (uniqueCards.length < 3) {
      console.error("Not enough unique cards:", {
        deckClass,
        rarity,
        available: cards.length,
      });
      return NextResponse.json(
        { error: "Not enough unique cards available" },
        { status: 400 }
      );
    }*/

    return NextResponse.json(cards);
  } catch (error: any) {
    console.error("Random cards error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch random cards" },
      { status: 500 }
    );
  }
}
