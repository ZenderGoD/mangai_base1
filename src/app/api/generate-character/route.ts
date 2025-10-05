import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY_ID || "",
});

// Type for FAL API response
interface FalImageResponse {
  data?: {
    images?: Array<{ url: string }>;
    seed?: number;
  };
  images?: Array<{ url: string }>;
  seed?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { characterPrompt, style = "manga" } = await req.json();

    if (!characterPrompt) {
      return NextResponse.json({ error: "Character prompt is required" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY_ID;
    if (!falKey) {
      throw new Error("FAL_KEY_ID not configured");
    }

    // Enhanced prompt specifically for character generation
    const enhancedPrompt = `${style} style character design: ${characterPrompt}. This is a character that the user is describing. Full body character reference sheet, clean linework, white background, detailed character design, consistent proportions, professional manga illustration.`;

    console.log("🎨 Generating character with Seedream v4:", enhancedPrompt);
    
    // Use portrait aspect ratio for character sheets
    const imageSize = { width: 1536, height: 2048 };
    
    const result: FalImageResponse = await fal.subscribe("fal-ai/bytedance/seedream/v4/text-to-image", {
      input: {
        prompt: enhancedPrompt,
        image_size: imageSize,
        num_images: 1,
        enable_safety_checker: false,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("⏳ Character generation in progress...");
        }
      },
    });

    console.log("📦 Seedream v4 Response:", JSON.stringify(result, null, 2));

    // Seedream returns images array
    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
    const generatedSeed = result.data?.seed || result.seed;
    
    if (!imageUrl) {
      console.error("❌ No character image URL found in response:", result);
      throw new Error("No character image generated");
    }

    console.log("✅ Character generated with Seedream v4:", imageUrl);
    console.log("🎲 Seed:", generatedSeed);

    return NextResponse.json({
      imageUrl,
      prompt: enhancedPrompt,
      seed: generatedSeed,
      description: characterPrompt,
    });
  } catch (error) {
    console.error("Character generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate character";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
