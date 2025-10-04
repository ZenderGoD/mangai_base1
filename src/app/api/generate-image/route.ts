import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY_ID || "",
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, style = "manga", aspectRatio = "1:1" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY_ID;
    if (!falKey) {
      throw new Error("FAL_KEY_ID not configured");
    }

    // Enhanced prompt for manga/anime style
    const enhancedPrompt = `${style} style: ${prompt}. High quality, detailed artwork, professional manga illustration.`;

    // Use FAL AI SDK for reliable image generation
    console.log("🎨 Generating image with prompt:", enhancedPrompt);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: enhancedPrompt,
        image_size: aspectRatio === "16:9" ? "landscape_16_9" : 
                    aspectRatio === "3:4" ? "portrait_4_3" : "square",
        num_images: 1,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("⏳ Image generation in progress...");
        }
      },
    });

    console.log("📦 FAL AI Response:", JSON.stringify(result, null, 2));

    // FLUX Schnell returns images in a different format
    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
    
    if (!imageUrl) {
      console.error("❌ No image URL found in response:", result);
      throw new Error("No image generated");
    }

    console.log("✅ Image generated:", imageUrl);

    return NextResponse.json({
      imageUrl,
      prompt: enhancedPrompt,
      description: result.data?.prompt || enhancedPrompt,
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

