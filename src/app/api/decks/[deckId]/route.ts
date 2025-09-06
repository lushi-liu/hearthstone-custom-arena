import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Deck from "@/models/Deck";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ deckId: string }> }
) {
  try {
    await connectDB();
    const { deckId } = await context.params;

    console.log("Delete deck request:", { deckId });

    if (!deckId || typeof deckId !== "string") {
      console.error("Validation failed: Invalid deckId", { deckId });
      return NextResponse.json({ error: "Invalid deck ID" }, { status: 400 });
    }

    const deck = await Deck.findOneAndDelete({ _id: deckId, type: "arena" });

    if (!deck) {
      console.error("Deck not found or not arena:", { deckId });
      return NextResponse.json(
        { error: "Deck not found or not an arena deck" },
        { status: 404 }
      );
    }

    console.log(`Deleted deck: ${deck.name} (${deckId})`);
    return NextResponse.json(
      { message: "Deck deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting deck:");
    return NextResponse.json(
      { error: "Failed to delete deck" },
      { status: 500 }
    );
  }
}
