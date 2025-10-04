import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY_ID || "",
});

export async function POST(req: NextRequest) {
  try {
    const { originalPrompt, suggestions, style = "manga" } = await req.json();

    if (!originalPrompt) {
      return NextResponse.json({ error: "Original prompt is required" }, { status: 400 });
    }

    // Enhance the prompt with consistency suggestions
    const refinedPrompt = suggestions && suggestions.length > 0
      ? `${style} style: ${originalPrompt}. IMPORTANT: ${suggestions.join(". ")}. High quality, detailed artwork, professional manga illustration, consistent character design.`
      : `${style} style: ${originalPrompt}. High quality, detailed artwork, professional manga illustration.`;

    console.log("🔧 Refining image with enhanced prompt:", refinedPrompt);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: refinedPrompt,
        image_size: "square",
        num_images: 1,
      },
      logs: true,
    });

    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
    
    if (!imageUrl) {
      console.error("❌ No image URL found in refined response:", result);
      throw new Error("No refined image generated");
    }

    console.log("✅ Refined image generated:", imageUrl);

    return NextResponse.json({
      imageUrl,
      refinedPrompt,
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

