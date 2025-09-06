import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const {
      name,
      type,
      class: cardClass,
      mana,
      attack,
      health,
      rarity,
      description,
      tribe,
    } = await req.json();

    // Log payload
    console.log("Received card payload:", {
      name,
      type,
      cardClass,
      mana,
      attack,
      health,
      rarity,
      description,
      tribe,
    });

    // Validate input
    if (!name) {
      console.error("Validation failed: Missing name");
      return NextResponse.json({ error: "Missing card name" }, { status: 400 });
    }
    if (!type || !["MINION", "SPELL", "WEAPON"].includes(type)) {
      console.error("Validation failed: Invalid type");
      return NextResponse.json(
        { error: "Type must be MINION, SPELL, or WEAPON" },
        { status: 400 }
      );
    }
    if (
      !cardClass ||
      ![
        "NEUTRAL",
        "MAGE",
        "SHAMAN",
        "DRUID",
        "HUNTER",
        "PALADIN",
        "PRIEST",
        "ROGUE",
        "WARLOCK",
        "WARRIOR",
      ].includes(cardClass)
    ) {
      console.error("Validation failed: Invalid class");
      return NextResponse.json(
        { error: "Invalid card class" },
        { status: 400 }
      );
    }
    if (typeof mana !== "number" || mana < 0) {
      console.error("Validation failed: Invalid mana");
      return NextResponse.json(
        { error: "Mana must be a non-negative number" },
        { status: 400 }
      );
    }
    if (
      (type === "MINION" || type === "WEAPON") &&
      (typeof attack !== "number" || attack < 0)
    ) {
      console.error("Validation failed: Invalid attack");
      return NextResponse.json(
        { error: "Attack must be a non-negative number for MINION or WEAPON" },
        { status: 400 }
      );
    }
    if (
      (type === "MINION" || type === "WEAPON") &&
      (typeof health !== "number" || health < 0)
    ) {
      console.error("Validation failed: Invalid health");
      return NextResponse.json(
        { error: "Health must be a non-negative number for MINION or WEAPON" },
        { status: 400 }
      );
    }
    if (!rarity || !["Common", "Rare", "Epic", "Legendary"].includes(rarity)) {
      console.error("Validation failed: Invalid rarity");
      return NextResponse.json(
        { error: "Rarity must be Common, Rare, Epic, or Legendary" },
        { status: 400 }
      );
    }
    if (!description) {
      console.error("Validation failed: Missing description");
      return NextResponse.json(
        { error: "Missing card description" },
        { status: 400 }
      );
    }

    // Generate unique cardId
    const timestamp = Date.now();
    const cardId = `CUSTOM_${timestamp}`;

    // Save card
    const card = new Card({
      cardId,
      name,
      type,
      class: cardClass,
      mana,
      attack: attack || 0,
      health: health || 0,
      rarity,
      description,
      tribe: tribe || "",
      source: "custom",
    });
    await card.save();

    console.log(`Created card: ${name} (${cardId})`);
    return NextResponse.json(
      { message: "Card created successfully", cardId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating card");
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}
