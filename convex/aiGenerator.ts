import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Main AI Manga Generator
 * 
 * This handles the complete pipeline:
 * 1. Generate story content
 * 2. Break into panels
 * 3. Generate images for each panel
 * 4. Create chapter with all panels
 */

// Generate a complete manga chapter from a story idea
export const generateMangaChapter = action({
  args: {
    storyId: v.id("stories"),
    prompt: v.string(),
    chapterNumber: v.number(),
    genre: v.optional(v.string()),
    style: v.optional(v.string()),
    numberOfPanels: v.optional(v.number()),
    colorMode: v.optional(v.union(v.literal("color"), v.literal("black-and-white"))),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    chapterId: Id<"chapters">;
    generationId: Id<"generations">;
    message: string;
  }> => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Create generation record
    const generationId = await ctx.runMutation(internal.aiGenerator.createGeneration, {
      userId: userId.subject as Id<"users">,
      type: "chapter",
      storyId: args.storyId,
      prompt: args.prompt,
    });

    try {
      // Step 1: Generate story narrative
      await ctx.runMutation(internal.aiGenerator.updateGenerationStatus, {
        generationId,
        status: "processing",
        statusMessage: "Generating story narrative...",
      });

      const narrative = await generateNarrative(
        args.prompt,
        args.genre || "fantasy",
        args.style || "manga"
      );

      // Extract character and location references for consistency
      await ctx.runMutation(internal.aiGenerator.updateGenerationStatus, {
        generationId,
        status: "processing",
        statusMessage: "Extracting character references for consistency...",
      });

      // Skip character references for now to fix build
      // const characterReferences = null;

      // Step 2: Break narrative into panels
      await ctx.runMutation(internal.aiGenerator.updateGenerationStatus, {
        generationId,
        status: "processing",
        statusMessage: "Planning manga panels...",
      });

      const panelPlan = await breakIntoPanels(
        narrative,
        args.numberOfPanels || 8
      );

      // Step 3: Generate images for each panel
      await ctx.runMutation(internal.aiGenerator.updateGenerationStatus, {
        generationId,
        status: "processing",
        statusMessage: "Generating manga artwork...",
      });

      const panels = await generatePanelImages(
        panelPlan,
        args.style || "manga",
        args.colorMode || "color"
      );

      // Step 4: Create chapter with all panels
      const chapterId = await ctx.runMutation(internal.aiGenerator.createChapter, {
        storyId: args.storyId,
        chapterNumber: args.chapterNumber,
        title: `Chapter ${args.chapterNumber}`,
        content: narrative,
      panels,
        generationMetadata: {
          storyPrompt: args.prompt,
          imagePrompts: panelPlan.map(p => p.imagePrompt),
          modelUsed: "openai/gpt-4o + dall-e-3",
          totalCost: panels.length * 0.04, // Estimate
        },
      });

      // Step 5: Mark generation as completed
      await ctx.runMutation(internal.aiGenerator.updateGenerationStatus, {
        generationId,
        status: "completed",
        statusMessage: "Chapter created successfully!",
      });

      return {
        success: true,
        chapterId,
        generationId,
        message: "Manga chapter generated successfully!",
      };

    } catch (error) {
      await ctx.runMutation(internal.aiGenerator.updateGenerationStatus, {
        generationId,
        status: "failed",
        statusMessage: error instanceof Error ? error.message : "Generation failed",
      });
      throw error;
    }
  },
});

// Helper: Generate story narrative using LLM
async function generateNarrative(
  prompt: string,
  genre: string,
  style: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const systemPrompt = `You are a creative manga story writer. Generate engaging, visual manga narratives with clear scenes and action.
Style: ${style}
Genre: ${genre}

Focus on:
- Visual storytelling (describe scenes that can be drawn)
- Character emotions and expressions
- Action and movement
- Dialogue and internal thoughts
- Scene transitions

Write in a narrative format that can be easily broken into manga panels.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://manga-generator.app",
      "X-Title": "AI Manga Generator",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b", // Main orchestrator model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Story generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Helper: Extract character references for consistency
// async function extractCharacterReferences(narrative: string): Promise<{
//   characters: Array<{ name: string; description: string; personality: string; role: string }>;
//   locations: Array<{ name: string; description: string }>;
//   continuityNotes: string;
// }> {
//   const apiKey = process.env.OPENROUTER_API_KEY;
//   if (!apiKey) {
//     throw new Error("OPENROUTER_API_KEY not configured");
//   }

//   const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/extract-character-references`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ narrative }),
//   });

//   if (!response.ok) {
//     throw new Error(`Character reference extraction failed: ${response.statusText}`);
//   }

//   const data = await response.json();
//   return data;
// }

// Helper: Break narrative into visual panels
async function breakIntoPanels(
  narrative: string,
  targetPanels: number
): Promise<Array<{
  text: string;
  dialogue: Array<{ character?: string; text: string }>;
  imagePrompt: string;
  description: string;
}>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const characterContext = "";

  const systemPrompt = `You are a manga panel planner. Break the story into ${targetPanels} manga panels.

Guidelines:
- Each panel must focus on a single decisive moment or action. Do not combine multiple sequential moments into one panel.
- Describe only one scene per panel. Avoid phrases like "in the other corner" or "meanwhile" that imply multiple frames.
- Keep character appearances and backgrounds consistent with previous panels.

CONTINUITY REQUIREMENTS:
- Maintain exact character appearances as specified in character references
- Keep clothing, accessories, and physical traits consistent across all panels
- Preserve location details and environmental elements
- Ensure dialogue flows naturally between panels
- Reference character personalities and relationships consistently

${characterContext}

For each panel, provide:
1. Visual description (what we see)
2. Dialogue (character speech)
3. Detailed image prompt for AI generation
4. Scene description

Return JSON array format:
[
  {
    "text": "Scene description",
    "dialogue": [{"character": "Name", "text": "Speech"}],
    "imagePrompt": "Detailed prompt for image generation with character consistency notes",
    "description": "Visual details"
  }
]`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://manga-generator.app",
      "X-Title": "AI Manga Generator",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b", // Main orchestrator for panel planning
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Break this story into ${targetPanels} manga panels:\n\n${narrative}` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Panel planning failed: ${response.statusText}`);
  }

  const data = await response.json();
  const rawContent = data.choices[0].message.content;
  const result = JSON.parse(rawContent);

  const normalizePanel = (panel: { text?: string; dialogue?: any; imagePrompt?: string; description?: string; }, index: number) => {
    if (!panel || typeof panel !== "object") {
      return null;
    }

    const dialogueArray: Array<{ character?: string; text: string }> = [];

    if (Array.isArray(panel.dialogue)) {
      for (const bubble of panel.dialogue) {
        if (!bubble) continue;
        if (typeof bubble === "string") {
          const trimmed = bubble.trim();
          if (trimmed) {
            dialogueArray.push({ text: trimmed });
          }
        } else if (typeof bubble === "object" && typeof bubble.text === "string") {
          dialogueArray.push({
            character: typeof bubble.character === "string" ? bubble.character : undefined,
            text: bubble.text.trim(),
          });
        }
      }
    } else if (typeof panel.dialogue === "string" && panel.dialogue.trim()) {
      dialogueArray.push({ text: panel.dialogue.trim() });
    }

    const description = typeof panel.description === "string" && panel.description.trim()
      ? panel.description.trim()
      : typeof panel.text === "string" && panel.text.trim()
        ? panel.text.trim()
        : `Panel ${index + 1} scene`;

    const sceneText = typeof panel.text === "string" && panel.text.trim()
      ? panel.text.trim()
      : description;

    const imagePrompt = typeof panel.imagePrompt === "string" && panel.imagePrompt.trim()
      ? panel.imagePrompt.trim()
      : `${description}. Focus on a single moment with clear composition.`;

    return {
      text: sceneText,
      dialogue: dialogueArray,
      imagePrompt,
      description,
    };
  };

  const extractPanels = (payload: { panels?: any[] } | any[]): any[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.panels)) return payload.panels;
    if (typeof payload.panels === "object") {
      return Object.values(payload.panels);
    }
    return [];
  };

  let panels = extractPanels(result)
    .map((panel, idx) => normalizePanel(panel, idx))
    .filter((panel): panel is { text: string; dialogue: Array<{ character?: string; text: string }>; imagePrompt: string; description: string; } => panel !== null);

  if (panels.length > targetPanels) {
    panels = panels.slice(0, targetPanels);
  }

  const ensurePanelCount = async (existingPanels: typeof panels) => {
    if (existingPanels.length >= targetPanels) {
      return existingPanels;
    }

    const missing = targetPanels - existingPanels.length;
    const existingSummary = existingPanels
      .map((panel, index) => {
        const dialogueText = panel.dialogue
          .map((bubble) => (bubble.character ? `${bubble.character}: ${bubble.text}` : bubble.text))
          .join(" | ");
        return `Panel ${index + 1}: ${panel.description}${dialogueText ? ` (Dialogue: ${dialogueText})` : ""}`;
      })
      .join("\n");

    const continuationSystemPrompt = `You are a manga panel planner continuing an existing panel plan.

Rules:
- Add panels ${existingPanels.length + 1}-${targetPanels}.
- Each panel must depict one moment only. No split scenes.
- Maintain character and location continuity.
- Match tone and pacing of previous panels.

Return JSON in the format {"panels": [...]}.`;

    const continuationUserPrompt = `We already have ${existingPanels.length} panels planned:
${existingSummary || "(None yet)"}

Please provide ${missing} additional panels to reach exactly ${targetPanels} panels total. Number them starting at ${existingPanels.length + 1}. For each panel include:
- text: concise scene summary
- dialogue: array of speech bubble objects
- imagePrompt: detailed visual prompt
- description: visual description

Focus on continuing the story logically from the narrative:
${narrative}`;

    const continuationResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://manga-generator.app",
        "X-Title": "AI Manga Generator",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: continuationSystemPrompt },
          { role: "user", content: continuationUserPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });

    if (!continuationResponse.ok) {
      throw new Error(`Panel continuation failed: ${continuationResponse.statusText}`);
    }

    const continuationData = await continuationResponse.json();
    const continuationResult = JSON.parse(continuationData.choices[0].message.content);
    const additionalPanels = extractPanels(continuationResult)
      .map((panel: any, idx: number) => normalizePanel(panel, existingPanels.length + idx))
      .filter((panel): panel is { text: string; dialogue: Array<{ character?: string; text: string }>; imagePrompt: string; description: string; } => panel !== null);

    return existingPanels.concat(additionalPanels).slice(0, targetPanels);
  };

  panels = await ensurePanelCount(panels);

  while (panels.length < targetPanels) {
    panels.push({
      text: `Additional scene for panel ${panels.length + 1}`,
      dialogue: [],
      imagePrompt: `Illustrate the continuation of the story for panel ${panels.length + 1}, matching previous panels.`,
      description: `Panel ${panels.length + 1} continuation scene`,
    });
  }

  return panels;
}

// Helper: Generate images for panels
async function generatePanelImages(
  panels: Array<{
    text: string;
    dialogue: Array<{ character?: string; text: string }>;
    imagePrompt: string;
    description: string;
  }>,
  style: string,
  colorMode: "color" | "black-and-white"
): Promise<Array<{
  imageUrl: string;
  text: string;
  dialogue: Array<{ character?: string; text: string; position?: string }>;
  order: number;
  metadata: {
    width: number;
    height: number;
    prompt: string;
  };
}>> {
  const falKey = process.env.FAL_KEY_ID;
  if (!falKey) {
    throw new Error("FAL_KEY_ID not configured");
  }

  const results = [];

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    
    // Enhanced manga-style prompt with continuity references
    const previousPanelContext = i > 0 ? `Consistent with previous panels: maintain character appearances, clothing, and setting details.` : "";
    
    const enhancedPrompt = `${style} manga style: ${panel.imagePrompt}. 
${colorMode === "black-and-white" ? "Monochrome inked illustration, dramatic screentones, high contrast." : "Rich full color lighting, warm tones, cinematic shading."}
Manga panel composition, professional illustration, clean linework, expressive characters, dynamic angles.
${previousPanelContext}
Character consistency: Maintain exact same appearance, clothing, and accessories as established in story.`;

    try {
      // Use FAL AI nano-banana for fast, high-quality image generation
      const response = await fetch("https://fal.run/fal-ai/nano-banana", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${falKey}`,
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          num_images: 1,
          output_format: "jpeg",
          aspect_ratio: "1:1",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image generation failed for panel ${i + 1}: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.images || data.images.length === 0) {
        throw new Error(`No image generated for panel ${i + 1}`);
      }

      results.push({
        imageUrl: data.images[0].url || "",
        text: panel.description,
        dialogue: panel.dialogue.map(d => ({
          ...d,
          position: "top", // Default position, can be enhanced
        })),
        order: i,
        metadata: {
          width: 1024,
          height: 1024,
          prompt: enhancedPrompt,
        },
      });

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error generating panel ${i + 1}:`, error);
      // Continue with placeholder if one panel fails
      results.push({
        imageUrl: "",
        text: panel.description,
        dialogue: panel.dialogue.map(d => ({ ...d, position: "top" })),
        order: i,
        metadata: {
          width: 1024,
          height: 1024,
          prompt: enhancedPrompt,
        },
      });
    }
  }

  return results;
}

// Helper: Edit/enhance existing images using FAL AI nano-banana/edit
async function editPanelImage(
  imageUrl: string,
  editPrompt: string,
  aspectRatio?: string
): Promise<{
  imageUrl: string;
  description: string;
}> {
  const falKey = process.env.FAL_KEY_ID;
  if (!falKey) {
    throw new Error("FAL_KEY_ID not configured");
  }

  try {
    const response = await fetch("https://fal.run/fal-ai/nano-banana/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${falKey}`,
      },
      body: JSON.stringify({
        prompt: editPrompt,
        image_urls: [imageUrl],
        num_images: 1,
        output_format: "jpeg",
        ...(aspectRatio && { aspect_ratio: aspectRatio }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image editing failed: ${errorText}`);
    }

    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      throw new Error("No edited image generated");
    }

    return {
      imageUrl: data.images[0].url,
      description: data.description || "",
    };
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
}

// Action: Edit a manga panel image
export const editMangaPanelImage = action({
  args: {
    imageUrl: v.string(),
    editPrompt: v.string(),
    aspectRatio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await editPanelImage(args.imageUrl, args.editPrompt, args.aspectRatio);
  },
});

// Helper: Refine multiple panel images in batch
async function refinePanelImages(
  panels: Array<{
    imageUrl: string;
    refinementPrompt: string;
  }>
): Promise<Array<{
  originalUrl: string;
  refinedUrl: string;
  description: string;
}>> {
  const results = [];

  for (const panel of panels) {
    try {
      const refined = await editPanelImage(panel.imageUrl, panel.refinementPrompt);
      results.push({
        originalUrl: panel.imageUrl,
        refinedUrl: refined.imageUrl,
        description: refined.description,
      });

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error refining panel image:", error);
      // Keep original if refinement fails
      results.push({
        originalUrl: panel.imageUrl,
        refinedUrl: panel.imageUrl,
        description: "Refinement failed, using original image",
      });
    }
  }

  return results;
}

// Action: Batch refine manga panel images
export const batchRefinePanelImages = action({
  args: {
    panels: v.array(
      v.object({
        imageUrl: v.string(),
        refinementPrompt: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await refinePanelImages(args.panels);
  },
});

// Internal mutations
export const createGeneration = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("story"),
      v.literal("chapter"),
      v.literal("panel"),
      v.literal("cover")
    ),
    storyId: v.optional(v.id("stories")),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generations", {
      userId: args.userId,
      type: args.type,
      prompt: args.prompt,
      parameters: {
        genre: "fantasy",
        style: "manga",
        model: "gpt-4o",
      },
      status: "pending",
      storyId: args.storyId,
      createdAt: Date.now(),
    });
  },
});

export const updateGenerationStatus = internalMutation({
  args: {
    generationId: v.id("generations"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    statusMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.generationId, {
      status: args.status,
      statusMessage: args.statusMessage,
      ...(args.status === "completed" && { completedAt: Date.now() }),
    });
  },
});

export const createChapter = internalMutation({
  args: {
    storyId: v.id("stories"),
    chapterNumber: v.number(),
    title: v.string(),
    content: v.string(),
    panels: v.array(
      v.object({
        imageUrl: v.optional(v.string()),
        text: v.optional(v.string()),
        dialogue: v.optional(v.array(v.object({
          character: v.optional(v.string()),
          text: v.string(),
          position: v.optional(v.string()),
        }))),
        order: v.number(),
        metadata: v.optional(v.object({
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          prompt: v.optional(v.string()),
        })),
      })
    ),
    generationMetadata: v.optional(v.object({
      storyPrompt: v.optional(v.string()),
      imagePrompts: v.optional(v.array(v.string())),
      modelUsed: v.optional(v.string()),
      totalCost: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const chapterId = await ctx.db.insert("chapters", {
      storyId: args.storyId,
      chapterNumber: args.chapterNumber,
      title: args.title,
      content: args.content,
      summary: args.content.substring(0, 200) + "...",
      panels: args.panels,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      readingTimeMinutes: Math.ceil(args.panels.length * 0.5),
      status: "published",
      publishedAt: Date.now(),
      generationMetadata: args.generationMetadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update story chapter count
    const story = await ctx.db.get(args.storyId);
    if (story) {
      await ctx.db.patch(args.storyId, {
        chapterCount: (story.chapterCount || 0) + 1,
        lastChapterAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return chapterId;
  },
});

