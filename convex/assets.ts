import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Generate upload URL for client-side uploads
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Store an image and register it in the assets table
export const storeAndRegisterImage = mutation({
  args: {
    storageId: v.id("_storage"),
    assetType: v.union(
      v.literal("character"),
      v.literal("scenario"),
      v.literal("object"),
      v.literal("story_cover"),
      v.literal("chapter_panel"),
      v.literal("other")
    ),
    userId: v.optional(v.id("users")),
    storyId: v.optional(v.id("stories")),
    characterId: v.optional(v.id("characters")),
    prompt: v.optional(v.string()),
    model: v.optional(v.string()),
    generationId: v.optional(v.id("generations")),
  },
  handler: async (ctx, args) => {
    const { storageId, ...assetData } = args;
    
    // Get file metadata
    const fileMetadata = await ctx.db.system.get(storageId);
    if (!fileMetadata) {
      throw new Error("File not found in storage");
    }

    // Create asset record
    const assetId = await ctx.db.insert("assets", {
      storageId,
      metadata: {
        width: undefined, // Could be extracted from image if needed
        height: undefined,
        fileSize: fileMetadata.size,
        mimeType: fileMetadata.contentType,
        hash: fileMetadata.sha256,
      },
      userId: assetData.userId,
      storyId: assetData.storyId,
      characterId: assetData.characterId,
      assetType: assetData.assetType,
      generationId: assetData.generationId,
      prompt: assetData.prompt,
      model: assetData.model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return assetId;
  },
});

// Download and store an image from a URL - simplified version
export const downloadAndStoreImage = action({
  args: {
    imageUrl: v.string(),
    assetType: v.union(
      v.literal("character"),
      v.literal("scenario"),
      v.literal("object"),
      v.literal("story_cover"),
      v.literal("chapter_panel"),
      v.literal("other")
    ),
    userId: v.optional(v.id("users")),
    storyId: v.optional(v.id("stories")),
    characterId: v.optional(v.id("characters")),
    prompt: v.optional(v.string()),
    model: v.optional(v.string()),
    generationId: v.optional(v.id("generations")),
  },
  handler: async (ctx, args) => {
    try {
      // Download the image
      const response = await fetch(args.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Store in Convex storage
      const storageId: Id<"_storage"> = await ctx.storage.store(blob);
      
      // For now, just return the storage ID - we'll register it separately
      // This avoids the circular reference issue
      const assetId = storageId; // Use storage ID as temporary asset ID
      
      return {
        assetId,
        storageId,
        success: true,
      };
    } catch (error) {
      console.error("Failed to download and store image:", error);
      return {
        assetId: null,
        storageId: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Get image URL from asset ID
export const getImageUrl = query({
  args: { assetId: v.id("assets") },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset || !asset.storageId) {
      return null;
    }
    
    return await ctx.storage.getUrl(asset.storageId);
  },
});

// Get asset by ID
export const getAsset = query({
  args: { assetId: v.id("assets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.assetId);
  },
});

// List assets by user
export const getAssetsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// List assets by story
export const getAssetsByStory = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();
  },
});

// Delete asset
export const deleteAsset = mutation({
  args: { assetId: v.id("assets") },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }
    
    // Delete from storage if it exists
    if (asset.storageId) {
      await ctx.storage.delete(asset.storageId);
    }
    
    // Delete asset record
    await ctx.db.delete(args.assetId);
    
    return { success: true };
  },
});