import { generateDescriptionSuggestions } from "@/lib/ai-suggestions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json();

    const suggestions = await generateDescriptionSuggestions(propertyData);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Description suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}