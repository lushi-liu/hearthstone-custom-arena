import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("class") || "";
    const limit = parseInt(searchParams.get("limit") || "3");

    const query = className ? { class: className.toUpperCase() } : {};
    const cards = await Card.aggregate([
      { $match: query },
      { $sample: { size: limit } },
    ]);

    if (!cards.length) {
      return NextResponse.json({ error: "No cards found" }, { status: 404 });
    }

    console.log(
      `Fetched cards for class: ${className || "any"} limit: ${limit} cards:`,
      cards.map((c) => c.name)
    );
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards");
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
