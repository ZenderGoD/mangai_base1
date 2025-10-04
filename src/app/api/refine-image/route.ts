import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY_ID || "",
});

export async function POST(req: NextRequest) {
  try {
    const { originalPrompt, suggestions, style = "manga", seed, aspectRatio = "1:1" } = await req.json();

    if (!originalPrompt) {
      return NextResponse.json({ error: "Original prompt is required" }, { status: 400 });
    }

    // Enhance the prompt with consistency suggestions
    const refinedPrompt = suggestions && suggestions.length > 0
      ? `${style} style: ${originalPrompt}. IMPORTANT FOR CONSISTENCY: ${suggestions.join(". ")}. High quality, detailed artwork, professional manga illustration, consistent character design.`
      : `${style} style: ${originalPrompt}. High quality, detailed artwork, professional manga illustration.`;

    console.log("🔧 Refining image with Seedream v4:", refinedPrompt);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await fal.subscribe("fal-ai/bytedance/seedream/v4/text-to-image", {
      input: {
        prompt: refinedPrompt,
        image_size: imageSize,
        num_images: 1,
        enable_safety_checker: false,
        ...(seed && { seed }), // Use same seed for better consistency
      },
      logs: true,
    });

    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
    const generatedSeed = result.data?.seed || result.seed;
    
    if (!imageUrl) {
      console.error("❌ No image URL found in refined response:", result);
      throw new Error("No refined image generated");
    }

    console.log("✅ Refined image generated with Seedream v4:", imageUrl);
    console.log("🎲 Seed:", generatedSeed);

    return NextResponse.json({
      imageUrl,
      refinedPrompt,
      seed: generatedSeed,
    });
  } catch (error) {
    console.error("Image refinement error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to refine image";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

