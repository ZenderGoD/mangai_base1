import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// Get all published stories
export const getStories = query({
  args: {
    limit: v.optional(v.number()),
    genre: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    let storiesQuery = ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc");

    if (args.genre) {
      storiesQuery = storiesQuery.filter((q) => q.eq(q.field("genre"), args.genre));
    }

    const stories = await storiesQuery.take(limit);

    // Fetch author info for each story
    const storiesWithAuthors = await Promise.all(
      stories.map(async (story) => {
        const author = await ctx.db.get(story.authorId);
        return {
          ...story,
          author: author
            ? {
                username: author.name || author.email || "Anonymous",
                imageUrl: author.image,
              }
            : null,
        };
      })
    );

    return storiesWithAuthors;
  },
});

// Get a single story by ID
export const getStory = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) return null;

    const author = await ctx.db.get(story.authorId);
    // Fetch characters (best-effort)
    const characters = await ctx.db
      .query("characters")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();

    return {
      ...story,
      characters,
      author: author
        ? {
            username: author.name || author.email || "Anonymous",
            imageUrl: author.image,
          }
        : null,
      chapters: chapters.sort((a, b) => a.chapterNumber - b.chapterNumber),
    };
  },
});

// Create a new story
export const createStory = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    genre: v.string(),
    tags: v.array(v.string()),
    coverImage: v.string(),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const storyId = await ctx.db.insert("stories", {
      title: args.title,
      description: args.description,
      synopsis: args.description,
      genre: args.genre,
      tags: args.tags,
      authorId: args.authorId,
      status: "draft",
      visibility: "private",
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      chapterCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return storyId;
  },
});

// Update story
export const updateStory = mutation({
  args: {
    storyId: v.id("stories"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    genre: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    coverImage: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { storyId, ...updates } = args;
    await ctx.db.patch(storyId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Increment view count
export const incrementViewCount = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) return;

    await ctx.db.patch(args.storyId, {
      viewCount: story.viewCount + 1,
    });
  },
});

// Get user's stories
export const getUserStories = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .collect();

    return stories;
  },
});

// Create a new story (manual upload)
export const create = mutation({
  args: {
    title: v.string(),
    synopsis: v.optional(v.string()),
    genre: v.string(),
    coverImageUrl: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    visibility: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("unlisted")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const storyId = await ctx.db.insert("stories", {
      title: args.title,
      synopsis: args.synopsis,
      description: args.synopsis || "",
      genre: args.genre,
      tags: [],
      authorId: userId,
      coverImageUrl: args.coverImageUrl,
      status: args.status,
      visibility: args.visibility,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      chapterCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return storyId;
  },
});

// Get current user's stories
export const getMyStories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const stories = await ctx.db
      .query("stories")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();

    return stories;
  },
});

