import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

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
    const { characterPrompt, style = "manga", referenceImageUrl, userId } = await req.json();

    if (!characterPrompt) {
      return NextResponse.json({ error: "Character prompt is required" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY_ID;
    if (!falKey) {
      throw new Error("FAL_KEY_ID not configured");
    }

    // Initialize Convex client for image storage
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Enhanced prompt specifically for character generation
    const enhancedPrompt = `${style} style character design: ${characterPrompt}. This is a character that the user is describing. Full body character reference sheet, clean linework, white background, detailed character design, consistent proportions, professional manga illustration.`;

    console.log("🎨 Generating character with Seedream v4:", enhancedPrompt);
    if (referenceImageUrl) {
      console.log("🖼️ Using reference image:", referenceImageUrl);
    }
    
    // Use portrait aspect ratio for character sheets
    const imageSize = { width: 1536, height: 2048 };
    
    let result: FalImageResponse;
    
    if (referenceImageUrl) {
      // Use Nano Banana for image-to-image when reference image is provided
      result = await fal.subscribe("fal-ai/nano-banana/edit", {
        input: {
          prompt: enhancedPrompt,
          image_urls: [referenceImageUrl],
          num_images: 1,
          output_format: "png",
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("⏳ Character generation in progress...");
          }
        },
      });
    } else {
      // Use Seedream v4 text-to-image when no reference image is provided
      result = await fal.subscribe("fal-ai/bytedance/seedream/v4/text-to-image", {
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
    }

    console.log("📦 Seedream v4 Response:", JSON.stringify(result, null, 2));

    // Seedream returns images array
    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
    const generatedSeed = result.data?.seed || result.seed || Math.floor(Math.random() * 1000000);
    
    if (!imageUrl) {
      console.error("❌ No character image URL found in response:", result);
      throw new Error("No character image generated");
    }

    console.log("✅ Character generated:", imageUrl);
    console.log("🎲 Seed:", generatedSeed);

    // Store image permanently in Convex storage
    let assetId = null;
    try {
      const storageResult = await convex.action(api.assets.downloadAndStoreImage, {
        imageUrl,
        assetType: "character",
        userId: userId as Id<"users"> | undefined,
        prompt: enhancedPrompt,
        model: referenceImageUrl ? "nano-banana" : "seedream-v4",
      });
      
      if (storageResult.success && storageResult.assetId) {
        assetId = storageResult.assetId;
        console.log("✅ Image stored in Convex with asset ID:", assetId);
      } else {
        console.warn("⚠️ Failed to store image in Convex:", storageResult.error);
      }
    } catch (storageError) {
      console.error("❌ Convex storage error:", storageError);
    }

    return NextResponse.json({
      imageUrl: imageUrl,
      assetId: assetId,
      prompt: enhancedPrompt,
      seed: generatedSeed,
      description: characterPrompt,
      model: referenceImageUrl ? "nano-banana" : "seedream-v4",
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
