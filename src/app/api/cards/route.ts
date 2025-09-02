import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    const card = new Card({ ...data, cardId: `custom_${Date.now()}` }); // Temp cardId for customs
    await card.save();
    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const cards = await Card.find({}).sort({ createdAt: -1 });
    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
