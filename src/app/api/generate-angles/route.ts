import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY_ID || "",
});

interface FalImageResponse {
  data?: {
    images: Array<{ url: string }>;
    seed?: number;
  };
  images?: Array<{ url: string }>;
  seed?: number;
}

interface GenerateAnglesRequest {
  itemType: "character" | "scenario" | "object";
  name: string;
  description: string;
  baseImageUrl?: string;
  style?: string;
  count?: number;
  userId?: string; // TODO: Add for permanent storage
}

export async function POST(req: NextRequest) {
  try {
    const { itemType, name, description, baseImageUrl, style = "manga", count = 4, userId }: GenerateAnglesRequest = await req.json();

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY_ID;
    if (!falKey) {
      throw new Error("FAL_KEY_ID not configured");
    }

    // Initialize Convex client for image storage
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    console.log(`🎨 Generating ${count} angles for ${itemType}: ${name}`);
    if (baseImageUrl) {
      console.log("🖼️ Using base image:", baseImageUrl);
    }

    // Create prompts for different angles based on item type
    const anglePrompts = generateAnglePrompts(itemType, name, description, style, count);

    const results = [];
    
    // Generate images for each angle
    for (let i = 0; i < count; i++) {
      try {
        let result: FalImageResponse;
        
        if (baseImageUrl) {
          // Use Nano Banana for image-to-image for ALL angles when base image is provided
          result = await fal.subscribe("fal-ai/nano-banana/edit", {
            input: {
              prompt: anglePrompts[i],
              image_urls: [baseImageUrl],
              num_images: 1,
              output_format: "png",
            },
            logs: true,
          });
        } else {
          // Use text-to-image only when no base image is provided
          result = await fal.subscribe("fal-ai/bytedance/seedream/v4/text-to-image", {
            input: {
              prompt: anglePrompts[i],
              image_size: { width: 1024, height: 1024 },
              num_images: 1,
              enable_safety_checker: false,
            },
            logs: true,
          });
        }

        const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
        const generatedSeed = result.data?.seed || result.seed;

        if (imageUrl) {
          console.log(`✅ Generated angle ${i + 1}:`, imageUrl);
          
          // Store image permanently in Convex storage
          let assetId = null;
          try {
            const storageResult = await convex.action(api.assets.downloadAndStoreImage, {
              imageUrl,
              assetType: itemType as "character" | "scenario" | "object",
              userId: userId as Id<"users"> | undefined,
              prompt: anglePrompts[i],
              model: baseImageUrl ? "nano-banana" : "seedream-v4",
            });
            
            if (storageResult.success && storageResult.assetId) {
              assetId = storageResult.assetId;
              console.log(`✅ Angle ${i + 1} stored in Convex with asset ID:`, assetId);
            } else {
              console.warn(`⚠️ Failed to store angle ${i + 1} in Convex:`, storageResult.error);
            }
          } catch (storageError) {
            console.error(`❌ Convex storage error for angle ${i + 1}:`, storageError);
          }

          results.push({
            id: `angle-${i + 1}`,
            imageUrl: imageUrl,
            assetId: assetId,
            description: `Angle ${i + 1}: ${anglePrompts[i].split('.')[0]}`,
            seed: generatedSeed,
          });
        }
      } catch (error) {
        console.error(`Error generating angle ${i + 1}:`, error);
        // Continue with other angles even if one fails
      }
    }

    console.log(`✅ Generated ${results.length} angles for ${itemType}: ${name}`);

    return NextResponse.json({
      success: true,
      angles: results,
      itemType,
      name,
    });
  } catch (error) {
    console.error("Generate angles error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate angles";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function generateAnglePrompts(
  itemType: "character" | "scenario" | "object",
  name: string,
  description: string,
  style: string,
  count: number
): string[] {
  const basePrompt = `${style} style: ${description}. High quality, detailed artwork, professional manga illustration. Maintain consistent character design, same facial features, hair, and clothing.`;

  switch (itemType) {
    case "character":
      return [
        `${basePrompt} ${name} full body portrait, front view, standing pose, same character design.`,
        `${basePrompt} ${name} close-up portrait, three-quarter view, confident expression, identical character features.`,
        `${basePrompt} ${name} action pose, dynamic angle, showing personality, consistent character appearance.`,
        `${basePrompt} ${name} profile view, side angle, detailed character design, same character as reference.`,
        `${basePrompt} ${name} back view, mysterious angle, showing character silhouette, consistent design.`,
        `${basePrompt} ${name} seated pose, relaxed angle, character study, same character features.`,
      ].slice(0, count);

    case "scenario":
      return [
        `${basePrompt} ${name} wide shot, establishing view, showing full scene.`,
        `${basePrompt} ${name} medium shot, dramatic angle, focusing on key elements.`,
        `${basePrompt} ${name} close-up view, intimate angle, showing details.`,
        `${basePrompt} ${name} bird's eye view, aerial perspective, showing scale.`,
        `${basePrompt} ${name} low angle view, dramatic perspective, emphasizing grandeur.`,
        `${basePrompt} ${name} side angle, different perspective, alternative composition.`,
      ].slice(0, count);

    case "object":
      return [
        `${basePrompt} ${name} front view, detailed object study, showing main features.`,
        `${basePrompt} ${name} three-quarter view, angled perspective, showing depth.`,
        `${basePrompt} ${name} side profile, clean angle, showing object silhouette.`,
        `${basePrompt} ${name} close-up detail, macro view, showing textures and materials.`,
        `${basePrompt} ${name} back view, alternative angle, showing hidden details.`,
        `${basePrompt} ${name} action shot, dynamic angle, showing object in use.`,
      ].slice(0, count);

    default:
      return Array(count).fill(basePrompt);
  }
}
