import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const cards = await Card.find({ source: "custom" })
      .select(
        "cardId name mana attack health rarity description tribe type class"
      )
      .lean();
    console.log(
      `Fetched ${cards.length} custom cards`,
      cards.map((c) => ({
        cardId: c.cardId,
        name: c.name,
      }))
    );
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching custom cards");
    return NextResponse.json(
      { error: "Failed to fetch custom cards" },
      { status: 500 }
    );
  }
}
