import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Card from "@/models/Card";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const result = await Card.deleteMany({
      source: { $regex: "^api:", $options: "i" },
    });
    return NextResponse.json(
      { deletedCount: result.deletedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete imported cards error");
    return NextResponse.json(
      { error: "Failed to delete imported cards" },
      { status: 500 }
    );
  }
}
