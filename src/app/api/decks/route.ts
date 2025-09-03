import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Deck from "@/models/Deck";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, class: deckClass, cards } = await req.json();

    if (!name || !deckClass || !cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: "Invalid deck data" }, { status: 400 });
    }

    if (cards.length > 30) {
      return NextResponse.json(
        { error: "Deck cannot have more than 30 cards" },
        { status: 400 }
      );
    }

    const deck = new Deck({ name, class: deckClass, cards });
    await deck.save();
    return NextResponse.json(deck, { status: 201 });
  } catch (error: any) {
    console.error("Deck creation error:", error.message);
    return NextResponse.json(
      { error: "Failed to create deck" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const decks = await Deck.find({}).populate("cards").sort({ createdAt: -1 });
    return NextResponse.json(decks);
  } catch (error: any) {
    console.error("Deck fetch error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch decks" },
      { status: 500 }
    );
  }
}
