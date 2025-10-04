import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get chapters for a story
export const getChapters = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();

    return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  },
});

// Get a single chapter
export const getChapter = query({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    const chapter = await ctx.db.get(args.chapterId);
    return chapter;
  },
});

// Create a new chapter
export const createChapter = mutation({
  args: {
    storyId: v.id("stories"),
    chapterNumber: v.number(),
    title: v.string(),
    content: v.string(),
    panels: v.array(
      v.object({
        imageUrl: v.string(),
        text: v.optional(v.string()),
        order: v.number(),
      })
    ),
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
      status: "published",
      publishedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return chapterId;
  },
});

// Update chapter
export const updateChapter = mutation({
  args: {
    chapterId: v.id("chapters"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    panels: v.optional(
      v.array(
        v.object({
          imageUrl: v.string(),
          text: v.optional(v.string()),
          order: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { chapterId, ...updates } = args;
    await ctx.db.patch(chapterId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

