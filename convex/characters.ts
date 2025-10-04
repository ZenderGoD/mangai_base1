import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Get all characters for a story
export const getByStory = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .order("desc")
      .collect();
  },
});

// Get a single character by ID
export const getById = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.characterId);
  },
});

// Search characters by name
export const searchByName = query({
  args: {
    storyId: v.id("stories"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withSearchIndex("search_characters", (q) =>
        q.search("name", args.searchTerm).eq("storyId", args.storyId)
      )
      .collect();
  },
});

// Get characters by role
export const getByRole = query({
  args: {
    storyId: v.id("stories"),
    role: v.union(
      v.literal("protagonist"),
      v.literal("antagonist"),
      v.literal("supporting"),
      v.literal("minor"),
      v.literal("cameo")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_story_role", (q) =>
        q.eq("storyId", args.storyId).eq("role", args.role)
      )
      .collect();
  },
});

// Create a new character
export const create = mutation({
  args: {
    storyId: v.id("stories"),
    name: v.string(),
    role: v.union(
      v.literal("protagonist"),
      v.literal("antagonist"),
      v.literal("supporting"),
      v.literal("minor"),
      v.literal("cameo")
    ),
    aliases: v.optional(v.array(v.string())),
    appearance: v.object({
      age: v.optional(v.string()),
      gender: v.optional(v.string()),
      height: v.optional(v.string()),
      build: v.optional(v.string()),
      hairColor: v.optional(v.string()),
      hairStyle: v.optional(v.string()),
      eyeColor: v.optional(v.string()),
      skinTone: v.optional(v.string()),
      distinctiveFeatures: v.optional(v.array(v.string())),
      clothing: v.optional(v.string()),
    }),
    personality: v.object({
      traits: v.optional(v.array(v.string())),
      strengths: v.optional(v.array(v.string())),
      weaknesses: v.optional(v.array(v.string())),
      likes: v.optional(v.array(v.string())),
      dislikes: v.optional(v.array(v.string())),
      fears: v.optional(v.array(v.string())),
      goals: v.optional(v.array(v.string())),
    }),
    behavior: v.object({
      speechPattern: v.optional(v.string()),
      mannerisms: v.optional(v.array(v.string())),
      habits: v.optional(v.array(v.string())),
      quirks: v.optional(v.array(v.string())),
    }),
    backstory: v.optional(v.string()),
    occupation: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    abilities: v.optional(v.array(v.string())),
    profileImageUrl: v.optional(v.string()),
    aiPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const characterId = await ctx.db.insert("characters", {
      storyId: args.storyId,
      authorId: userId,
      name: args.name,
      role: args.role,
      aliases: args.aliases,
      appearance: args.appearance,
      personality: args.personality,
      behavior: args.behavior,
      backstory: args.backstory,
      occupation: args.occupation,
      skills: args.skills,
      abilities: args.abilities,
      profileImageUrl: args.profileImageUrl,
      aiPrompt: args.aiPrompt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return characterId;
  },
});

// Update a character
export const update = mutation({
  args: {
    characterId: v.id("characters"),
    name: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("protagonist"),
        v.literal("antagonist"),
        v.literal("supporting"),
        v.literal("minor"),
        v.literal("cameo")
      )
    ),
    aliases: v.optional(v.array(v.string())),
    appearance: v.optional(
      v.object({
        age: v.optional(v.string()),
        gender: v.optional(v.string()),
        height: v.optional(v.string()),
        build: v.optional(v.string()),
        hairColor: v.optional(v.string()),
        hairStyle: v.optional(v.string()),
        eyeColor: v.optional(v.string()),
        skinTone: v.optional(v.string()),
        distinctiveFeatures: v.optional(v.array(v.string())),
        clothing: v.optional(v.string()),
      })
    ),
    personality: v.optional(
      v.object({
        traits: v.optional(v.array(v.string())),
        strengths: v.optional(v.array(v.string())),
        weaknesses: v.optional(v.array(v.string())),
        likes: v.optional(v.array(v.string())),
        dislikes: v.optional(v.array(v.string())),
        fears: v.optional(v.array(v.string())),
        goals: v.optional(v.array(v.string())),
      })
    ),
    behavior: v.optional(
      v.object({
        speechPattern: v.optional(v.string()),
        mannerisms: v.optional(v.array(v.string())),
        habits: v.optional(v.array(v.string())),
        quirks: v.optional(v.array(v.string())),
      })
    ),
    backstory: v.optional(v.string()),
    occupation: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    abilities: v.optional(v.array(v.string())),
    profileImageUrl: v.optional(v.string()),
    aiPrompt: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    if (character.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.role !== undefined) updates.role = args.role;
    if (args.aliases !== undefined) updates.aliases = args.aliases;
    if (args.appearance !== undefined) updates.appearance = args.appearance;
    if (args.personality !== undefined) updates.personality = args.personality;
    if (args.behavior !== undefined) updates.behavior = args.behavior;
    if (args.backstory !== undefined) updates.backstory = args.backstory;
    if (args.occupation !== undefined) updates.occupation = args.occupation;
    if (args.skills !== undefined) updates.skills = args.skills;
    if (args.abilities !== undefined) updates.abilities = args.abilities;
    if (args.profileImageUrl !== undefined) updates.profileImageUrl = args.profileImageUrl;
    if (args.aiPrompt !== undefined) updates.aiPrompt = args.aiPrompt;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.characterId, updates);
    return args.characterId;
  },
});

// Delete a character
export const remove = mutation({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    if (character.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.characterId);
  },
});

