import { analyzePhotoQuality } from "@/lib/ai-suggestions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image required" },
        { status: 400 }
      );
    }

    const analysis = await analyzePhotoQuality(imageBase64);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Photo analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze photo" },
      { status: 500 }
    );
  }
}