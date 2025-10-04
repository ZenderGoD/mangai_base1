import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Get all locations for a story
export const getByStory = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .order("desc")
      .collect();
  },
});

// Get a single location by ID
export const getById = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.locationId);
  },
});

// Search locations by name
export const searchByName = query({
  args: {
    storyId: v.id("stories"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .withSearchIndex("search_locations", (q) =>
        q.search("name", args.searchTerm).eq("storyId", args.storyId)
      )
      .collect();
  },
});

// Get locations by type
export const getByType = query({
  args: {
    storyId: v.id("stories"),
    type: v.union(
      v.literal("city"),
      v.literal("town"),
      v.literal("building"),
      v.literal("room"),
      v.literal("outdoor"),
      v.literal("fantasy"),
      v.literal("scifi"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_story_type", (q) =>
        q.eq("storyId", args.storyId).eq("type", args.type)
      )
      .collect();
  },
});

// Create a new location
export const create = mutation({
  args: {
    storyId: v.id("stories"),
    name: v.string(),
    type: v.union(
      v.literal("city"),
      v.literal("town"),
      v.literal("building"),
      v.literal("room"),
      v.literal("outdoor"),
      v.literal("fantasy"),
      v.literal("scifi"),
      v.literal("other")
    ),
    description: v.string(),
    atmosphere: v.optional(v.string()),
    visualDetails: v.object({
      architecture: v.optional(v.string()),
      colors: v.optional(v.array(v.string())),
      lighting: v.optional(v.string()),
      weather: v.optional(v.string()),
      timeOfDay: v.optional(v.string()),
      season: v.optional(v.string()),
    }),
    significance: v.optional(v.string()),
    keyEvents: v.optional(v.array(v.string())),
    aiPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const locationId = await ctx.db.insert("locations", {
      storyId: args.storyId,
      authorId: userId,
      name: args.name,
      type: args.type,
      description: args.description,
      atmosphere: args.atmosphere,
      visualDetails: args.visualDetails,
      significance: args.significance,
      keyEvents: args.keyEvents,
      aiPrompt: args.aiPrompt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return locationId;
  },
});

// Update a location
export const update = mutation({
  args: {
    locationId: v.id("locations"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("city"),
        v.literal("town"),
        v.literal("building"),
        v.literal("room"),
        v.literal("outdoor"),
        v.literal("fantasy"),
        v.literal("scifi"),
        v.literal("other")
      )
    ),
    description: v.optional(v.string()),
    atmosphere: v.optional(v.string()),
    visualDetails: v.optional(
      v.object({
        architecture: v.optional(v.string()),
        colors: v.optional(v.array(v.string())),
        lighting: v.optional(v.string()),
        weather: v.optional(v.string()),
        timeOfDay: v.optional(v.string()),
        season: v.optional(v.string()),
      })
    ),
    significance: v.optional(v.string()),
    keyEvents: v.optional(v.array(v.string())),
    aiPrompt: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    if (location.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.type !== undefined) updates.type = args.type;
    if (args.description !== undefined) updates.description = args.description;
    if (args.atmosphere !== undefined) updates.atmosphere = args.atmosphere;
    if (args.visualDetails !== undefined) updates.visualDetails = args.visualDetails;
    if (args.significance !== undefined) updates.significance = args.significance;
    if (args.keyEvents !== undefined) updates.keyEvents = args.keyEvents;
    if (args.aiPrompt !== undefined) updates.aiPrompt = args.aiPrompt;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.locationId, updates);
    return args.locationId;
  },
});

// Delete a location
export const remove = mutation({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const location = await ctx.db.get(args.locationId);
    if (!location) {
      throw new Error("Location not found");
    }

    if (location.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.locationId);
  },
});

