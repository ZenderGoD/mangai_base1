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
    const { prompt, style = "manga", aspectRatio = "1:1", seed } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY_ID;
    if (!falKey) {
      throw new Error("FAL_KEY_ID not configured");
    }

    // Enhanced prompt for manga/anime style
    const enhancedPrompt = `${style} style: ${prompt}. High quality, detailed artwork, professional manga illustration.`;

    // Use Seedream v4 for high-quality manga generation with better continuity
    console.log("🎨 Generating image with Seedream v4:", enhancedPrompt);
    
    // Calculate image size based on aspect ratio
    let imageSize: { width: number; height: number };
    if (aspectRatio === "16:9") {
      imageSize = { width: 2048, height: 1152 };
    } else if (aspectRatio === "3:4") {
      imageSize = { width: 1536, height: 2048 };
    } else {
      imageSize = { width: 2048, height: 2048 }; // square
    }
    
    const result: FalImageResponse = await fal.subscribe("fal-ai/bytedance/seedream/v4/text-to-image", {
      input: {
        prompt: enhancedPrompt,
        image_size: imageSize,
        num_images: 1,
        enable_safety_checker: false, // Disable for artistic content
        ...(seed ? { seed } : {}),
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("⏳ Seedream v4 generation in progress...");
        }
      },
    });

    console.log("📦 Seedream v4 Response:", JSON.stringify(result, null, 2));

    // Seedream returns images array
    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
    const generatedSeed = result.data?.seed || result.seed;
    
    if (!imageUrl) {
      console.error("❌ No image URL found in response:", result);
      throw new Error("No image generated");
    }

    console.log("✅ Image generated with Seedream v4:", imageUrl);
    console.log("🎲 Seed:", generatedSeed);

    return NextResponse.json({
      imageUrl,
      prompt: enhancedPrompt,
      seed: generatedSeed, // Return actual seed used/generated
      description: enhancedPrompt,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

