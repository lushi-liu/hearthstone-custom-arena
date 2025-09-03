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

    // Fetch 3 random cards of the chosen rarity and class (or Neutral)
    const cards = await Card.aggregate([
      {
        $match: {
          rarity: { $in: [rarity, rarity.toUpperCase()] }, // Handle API case
          class: {
            $in: [deckClass, deckClass.toUpperCase(), "Neutral", "NEUTRAL"],
          },
        },
      },
      { $sample: { size: 3 } }, // Randomly select 3
    ]);

    if (cards.length < 3) {
      return NextResponse.json(
        { error: "Not enough cards available" },
        { status: 400 }
      );
    }

    return NextResponse.json(cards);
  } catch (error: any) {
    console.error("Random cards error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch random cards" },
      { status: 500 }
    );
  }
}
