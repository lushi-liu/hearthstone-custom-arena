import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Deck from "@/models/Deck";
import Card from "@/models/Card";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const decks = await Deck.find({ type: "arena" })
      .populate("cardIds", "cardId name mana")
      .lean();
    console.log(`Fetched ${decks.length} decks`);
    return NextResponse.json(decks);
  } catch (error) {
    console.error("Error fetching decks");
    return NextResponse.json(
      { error: "Failed to fetch decks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, class: deckClass, cardIds, type } = await req.json();

    console.log("Received deck payload:", {
      name,
      deckClass,
      cardIdsLength: cardIds?.length,
      type,
      cardIds, // Log all cardIds
    });

    // Validate input
    if (!name) {
      console.error("Validation failed: Missing name");
      return NextResponse.json({ error: "Missing deck name" }, { status: 400 });
    }
    if (!deckClass) {
      console.error("Validation failed: Missing class");
      return NextResponse.json(
        { error: "Missing deck class" },
        { status: 400 }
      );
    }
    if (!cardIds || !Array.isArray(cardIds) || cardIds.length !== 30) {
      console.error("Validation failed: Invalid cardIds", {
        cardIdsLength: cardIds?.length,
      });
      return NextResponse.json(
        {
          error: `Invalid cardIds, must be array of 30, got ${cardIds?.length}`,
        },
        { status: 400 }
      );
    }
    if (!type) {
      console.error("Validation failed: Missing type");
      return NextResponse.json({ error: "Missing deck type" }, { status: 400 });
    }
    // Ensure cardIds are strings
    if (!cardIds.every((id) => typeof id === "string")) {
      console.error("Validation failed: cardIds must be strings", {
        invalidIds: cardIds.filter((id) => typeof id !== "string"),
      });
      return NextResponse.json(
        { error: "All cardIds must be strings" },
        { status: 400 }
      );
    }

    // Verify all cardIds exist
    const uniqueCardIds = [...new Set(cardIds)]; // Check unique cardIds
    const cardsExist = await Card.find({
      cardId: { $in: uniqueCardIds },
    }).select("cardId");
    const foundIds = cardsExist.map((c) => c.cardId.toString());
    const missingIds = uniqueCardIds.filter((id) => !foundIds.includes(id));
    if (missingIds.length > 0) {
      console.error("Validation failed: Some card IDs not found", {
        missing: missingIds,
      });
      return NextResponse.json(
        { error: `Some card IDs not found: ${missingIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Save deck
    const deck = new Deck({
      name,
      class: deckClass.toUpperCase(),
      cardIds,
      type,
    });
    await deck.save();

    console.log(`Saved deck: ${name} (${deckClass}, ${cardIds.length} cards)`);
    return NextResponse.json(
      { message: "Deck saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving deck");
    return NextResponse.json({ error: "Failed to save deck" }, { status: 500 });
  }
}
