import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY_ID || "",
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // For now, just generate a new image based on the prompt
    // Reference images are used to inform the prompt but we generate fresh
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: aspectRatio === "16:9" ? "landscape_16_9" : 
                    aspectRatio === "3:4" ? "portrait_4_3" : "square",
        num_images: 1,
      },
      logs: true,
    });

    if (!result.data?.images || result.data.images.length === 0) {
      throw new Error("No image generated");
    }

    return NextResponse.json({
      imageUrl: result.data.images[0].url,
      prompt,
      description: result.data.prompt,
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
