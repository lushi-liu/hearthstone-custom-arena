import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Deck from "@/models/Deck";
import Card from "@/models/Card";

interface Card {
  cardId: string;
  name: string;
  mana: number;
  imageUrl: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const decks = await Deck.find({ type: "arena" }).lean();
    // Populate card details
    const populatedDecks = await Promise.all(
      decks.map(async (deck) => {
        const cards = await Card.find({ cardId: { $in: deck.cardIds } }).select(
          "cardId name mana imageUrl"
        );
        // Sort cards by mana, then name
        const sortedCards = deck.cardIds
          .map((cardId: string) => {
            const card = cards.find(
              (c) => c.cardId.toString() === cardId.toString()
            );
            return (
              card || {
                cardId,
                name: "Unknown",
                mana: 0,
                imageUrl: "https://via.placeholder.com/128x192?text=Unknown",
              }
            );
          })
          .sort((a: Card, b: Card) => {
            if (a.mana !== b.mana) return a.mana - b.mana;
            return a.name.localeCompare(b.name);
          });
        return { ...deck, cards: sortedCards };
      })
    );

    console.log(`Fetched ${populatedDecks.length} decks`);
    return NextResponse.json(populatedDecks);
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
      cardIds,
    });

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
    if (!cardIds.every((id) => typeof id === "string")) {
      console.error("Validation failed: cardIds must be strings", {
        invalidIds: cardIds.filter((id) => typeof id !== "string"),
      });
      return NextResponse.json(
        { error: "All cardIds must be strings" },
        { status: 400 }
      );
    }

    const uniqueCardIds = [...new Set(cardIds)];
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
