import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    await connectDB();
    const { cardId } = await context.params;

    console.log("Delete card request:", { cardId });

    // Validate cardId
    if (!cardId || typeof cardId !== "string") {
      console.error("Validation failed: Invalid cardId", { cardId });
      return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
    }

    // Find and delete card (only custom cards)
    const card = await Card.findOneAndDelete({ cardId, source: "custom" });

    if (!card) {
      console.error("Card not found or not custom:", { cardId });
      return NextResponse.json(
        { error: "Card not found or not a custom card" },
        { status: 404 }
      );
    }

    console.log(`Deleted card: ${card.name} (${cardId})`);
    return NextResponse.json(
      { message: "Card deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting card");
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
