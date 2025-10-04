import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY_ID || "",
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio, seed } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    console.log("🔧 Image editing with Seedream v4:", prompt);
    if (seed) console.log("🎲 Using seed for consistency:", seed);

    // Calculate image size based on aspect ratio
    let imageSize: { width: number; height: number };
    if (aspectRatio === "16:9") {
      imageSize = { width: 2048, height: 1152 };
    } else if (aspectRatio === "3:4") {
      imageSize = { width: 1536, height: 2048 };
    } else {
      imageSize = { width: 2048, height: 2048 }; // square
    }

    // Use Seedream v4 for image generation with optional seed for consistency
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await fal.subscribe("fal-ai/bytedance/seedream/v4/text-to-image", {
      input: {
        prompt,
        image_size: imageSize,
        num_images: 1,
        enable_safety_checker: false,
        ...(seed && { seed }), // Use same seed for consistency if provided
      },
      logs: true,
    });

    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
    const generatedSeed = result.data?.seed || result.seed;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    console.log("✅ Image edited with Seedream v4:", imageUrl);

    return NextResponse.json({
      imageUrl,
      prompt,
      seed: generatedSeed,
      description: prompt,
    });
  } catch (error) {
    console.error("Image editing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to edit image";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
