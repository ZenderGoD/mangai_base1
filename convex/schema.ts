import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Assets - For permanent image storage
  assets: defineTable({
    storageId: v.optional(v.id("_storage")), // Links to Convex storage
    url: v.optional(v.string()), // Public URL
    alternateStorageIds: v.optional(v.array(v.id("_storage"))), // Alternative versions
    // Metadata
    metadata: v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      fileSize: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      hash: v.optional(v.string()), // SHA256 hash for deduplication
    }),
    // Usage tracking
    userId: v.optional(v.id("users")), // Owner
    storyId: v.optional(v.id("stories")), // Associated story
    chapterId: v.optional(v.id("chapters")), // Associated chapter
    characterId: v.optional(v.id("characters")), // Associated character
    // Asset type
    assetType: v.union(
      v.literal("character"),
      v.literal("scenario"), 
      v.literal("object"),
      v.literal("story_cover"),
      v.literal("chapter_panel"),
      v.literal("other")
    ),
    // Generation info
    generationId: v.optional(v.id("generations")), // Link to generation record
    prompt: v.optional(v.string()), // Original generation prompt
    model: v.optional(v.string()), // AI model used
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_story", ["storyId"])
    .index("by_character", ["characterId"])
    .index("by_generation", ["generationId"])
    .index("by_type", ["assetType"]),

  // Override users table to include additional manga platform fields
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Manga platform specific fields
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("creator"), v.literal("reader"))),
    // Stats
    followerCount: v.optional(v.number()),
    followingCount: v.optional(v.number()),
    totalViews: v.optional(v.number()),
    totalLikes: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("username", ["username"])
    .searchIndex("search_users", {
      searchField: "username",
      filterFields: ["role"],
    }),

  // User Credits - For AI Generation
  credits: defineTable({
    userId: v.id("users"),
    balance: v.number(), // Current credit balance
    totalEarned: v.number(), // Total credits earned (purchases + bonuses)
    totalSpent: v.number(), // Total credits spent on generations
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),

  // User MangaCoins - For Reading Exclusive Content
  mangaCoins: defineTable({
    userId: v.id("users"),
    balance: v.number(), // Current coin balance
    totalEarned: v.number(), // Total coins earned (purchases + bonuses)
    totalSpent: v.number(), // Total coins spent on content
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),

  // Credit Transactions
  creditTransactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("purchase"), // Bought credits
      v.literal("spent"), // Used credits for generation
      v.literal("bonus"), // Free credits (signup, referral, etc.)
      v.literal("refund") // Credit refund
    ),
    amount: v.number(), // Positive for add, negative for spend
    balanceBefore: v.number(),
    balanceAfter: v.number(),
    description: v.string(),
    metadata: v.optional(v.object({
      generationId: v.optional(v.id("generations")),
      purchaseId: v.optional(v.string()),
      packageId: v.optional(v.string()),
    })),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_type", ["type"]),

  // MangaCoin Transactions
  coinTransactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("purchase"), // Bought coins
      v.literal("spent"), // Used coins for content
      v.literal("earned"), // Earned from content (for creators)
      v.literal("bonus"), // Free coins
      v.literal("refund") // Coin refund
    ),
    amount: v.number(),
    balanceBefore: v.number(),
    balanceAfter: v.number(),
    description: v.string(),
    metadata: v.optional(v.object({
      storyId: v.optional(v.id("stories")),
      chapterId: v.optional(v.id("chapters")),
      purchaseId: v.optional(v.string()),
      packageId: v.optional(v.string()),
    })),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_type", ["type"]),

  // Purchase History
  purchases: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("credits"), v.literal("mangacoins")),
    packageId: v.string(), // Reference to pricing package
    packageName: v.string(),
    amount: v.number(), // Number of credits/coins purchased
    price: v.number(), // Price in USD (cents)
    currency: v.string(), // USD, EUR, etc.
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentMethod: v.optional(v.string()),
    paymentProvider: v.optional(v.string()), // stripe, paypal, etc.
    transactionId: v.optional(v.string()), // External payment ID
    invoiceUrl: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // Pricing Packages
  packages: defineTable({
    type: v.union(v.literal("credits"), v.literal("mangacoins")),
    name: v.string(),
    description: v.string(),
    amount: v.number(), // Number of credits/coins
    bonus: v.optional(v.number()), // Bonus amount
    price: v.number(), // Price in USD (cents)
    currency: v.string(),
    popular: v.boolean(), // Featured package
    discount: v.optional(v.number()), // Percentage discount
    active: v.boolean(),
    displayOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_type_active", ["type", "active"]),

  // User profiles and preferences
  profiles: defineTable({
    userId: v.id("users"),
    preferences: v.object({
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
      language: v.optional(v.string()),
      emailNotifications: v.boolean(),
      autoSave: v.boolean(),
      readingMode: v.optional(v.union(v.literal("scroll"), v.literal("page"))),
      defaultGenre: v.optional(v.string()),
    }),
    settings: v.object({
      timezone: v.string(),
      aiModelPreference: v.optional(v.string()),
    }),
  }).index("by_user", ["userId"]),

  // Stories (main content)
  stories: defineTable({
    title: v.string(),
    description: v.string(),
    synopsis: v.optional(v.string()),
    genre: v.string(),
    tags: v.array(v.string()),
    authorId: v.id("users"),
    coverImageUrl: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("hiatus"),
      v.literal("archived")
    ),
    visibility: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("unlisted")
    ),
    // Stats
    viewCount: v.number(),
    likeCount: v.number(),
    commentCount: v.number(),
    chapterCount: v.number(),
    // AI Generation metadata
    generationMetadata: v.optional(v.object({
      originalPrompt: v.optional(v.string()),
      modelUsed: v.optional(v.string()),
      generatedAt: v.optional(v.number()),
      processingTimeMs: v.optional(v.number()),
    })),
    // Publishing
    publishedAt: v.optional(v.number()),
    lastChapterAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_genre", ["genre"])
    .index("by_status", ["status"])
    .index("by_visibility", ["visibility"])
    .index("by_published", ["status", "publishedAt"])
    .index("by_author_status", ["authorId", "status"])
    .searchIndex("search_stories", {
      searchField: "title",
      filterFields: ["authorId", "genre", "status"],
    }),

  // Chapters
  chapters: defineTable({
    storyId: v.id("stories"),
    chapterNumber: v.number(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    // Manga panels
    panels: v.array(
      v.object({
        imageUrl: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
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
    // Stats
    viewCount: v.number(),
    likeCount: v.number(),
    commentCount: v.number(),
    readingTimeMinutes: v.optional(v.number()),
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("scheduled")
    ),
    publishedAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
    // AI Generation metadata
    generationMetadata: v.optional(v.object({
      storyPrompt: v.optional(v.string()),
      imagePrompts: v.optional(v.array(v.string())),
      modelUsed: v.optional(v.string()),
      totalCost: v.optional(v.number()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_story", ["storyId"])
    .index("by_story_number", ["storyId", "chapterNumber"])
    .index("by_story_status", ["storyId", "status"])
    .index("by_status", ["status"]),

  // Characters - Detailed character profiles for stories
  characters: defineTable({
    storyId: v.id("stories"),
    authorId: v.id("users"),
    // Basic Info
    name: v.string(),
    aliases: v.optional(v.array(v.string())),
    role: v.union(
      v.literal("protagonist"),
      v.literal("antagonist"),
      v.literal("supporting"),
      v.literal("minor"),
      v.literal("cameo")
    ),
    // Visual Details
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
    // Character Images
    profileImageUrl: v.optional(v.string()),
    profileImageStorageId: v.optional(v.id("_storage")),
    referenceImages: v.optional(v.array(v.object({
      url: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      description: v.optional(v.string()),
      pose: v.optional(v.string()),
    }))),
    // Personality & Traits
    personality: v.object({
      traits: v.optional(v.array(v.string())),
      strengths: v.optional(v.array(v.string())),
      weaknesses: v.optional(v.array(v.string())),
      likes: v.optional(v.array(v.string())),
      dislikes: v.optional(v.array(v.string())),
      fears: v.optional(v.array(v.string())),
      goals: v.optional(v.array(v.string())),
    }),
    // Background
    backstory: v.optional(v.string()),
    occupation: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    abilities: v.optional(v.array(v.string())),
    // Relationships
    relationships: v.optional(v.array(v.object({
      characterId: v.optional(v.id("characters")),
      characterName: v.string(),
      relationshipType: v.string(),
      description: v.optional(v.string()),
    }))),
    // Behavior & Speech
    behavior: v.object({
      speechPattern: v.optional(v.string()),
      mannerisms: v.optional(v.array(v.string())),
      habits: v.optional(v.array(v.string())),
      quirks: v.optional(v.array(v.string())),
    }),
    // Story Arc
    characterArc: v.optional(v.object({
      startingPoint: v.optional(v.string()),
      development: v.optional(v.string()),
      endGoal: v.optional(v.string()),
    })),
    // AI Generation
    aiPrompt: v.optional(v.string()),
    aiGenerationSettings: v.optional(v.object({
      style: v.optional(v.string()),
      modelUsed: v.optional(v.string()),
      consistencyNotes: v.optional(v.string()),
    })),
    // Metadata
    firstAppearance: v.optional(v.id("chapters")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_story", ["storyId"])
    .index("by_author", ["authorId"])
    .index("by_role", ["role"])
    .index("by_story_role", ["storyId", "role"])
    .searchIndex("search_characters", {
      searchField: "name",
      filterFields: ["storyId", "role"],
    }),

  // Locations - Places and settings in stories
  locations: defineTable({
    storyId: v.id("stories"),
    authorId: v.id("users"),
    // Basic Info
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
    // Description
    description: v.string(),
    atmosphere: v.optional(v.string()),
    // Visual Details
    visualDetails: v.object({
      architecture: v.optional(v.string()),
      colors: v.optional(v.array(v.string())),
      lighting: v.optional(v.string()),
      weather: v.optional(v.string()),
      timeOfDay: v.optional(v.string()),
      season: v.optional(v.string()),
    }),
    // Reference Images
    referenceImages: v.optional(v.array(v.object({
      url: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      description: v.optional(v.string()),
      angle: v.optional(v.string()),
    }))),
    // Significance
    significance: v.optional(v.string()),
    keyEvents: v.optional(v.array(v.string())),
    // Geography
    parentLocation: v.optional(v.id("locations")),
    subLocations: v.optional(v.array(v.string())),
    // AI Generation
    aiPrompt: v.optional(v.string()),
    aiGenerationSettings: v.optional(v.object({
      style: v.optional(v.string()),
      modelUsed: v.optional(v.string()),
    })),
    // Metadata
    firstAppearance: v.optional(v.id("chapters")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_story", ["storyId"])
    .index("by_author", ["authorId"])
    .index("by_type", ["type"])
    .index("by_story_type", ["storyId", "type"])
    .searchIndex("search_locations", {
      searchField: "name",
      filterFields: ["storyId", "type"],
    }),

  // Story Elements - Other important story references (items, events, concepts)
  storyElements: defineTable({
    storyId: v.id("stories"),
    authorId: v.id("users"),
    // Basic Info
    name: v.string(),
    type: v.union(
      v.literal("item"),
      v.literal("weapon"),
      v.literal("artifact"),
      v.literal("vehicle"),
      v.literal("technology"),
      v.literal("magic"),
      v.literal("event"),
      v.literal("organization"),
      v.literal("concept"),
      v.literal("other")
    ),
    // Details
    description: v.string(),
    properties: v.optional(v.array(v.string())),
    abilities: v.optional(v.array(v.string())),
    limitations: v.optional(v.array(v.string())),
    // Visual
    visualDescription: v.optional(v.string()),
    referenceImages: v.optional(v.array(v.object({
      url: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      description: v.optional(v.string()),
    }))),
    // Story Significance
    origin: v.optional(v.string()),
    significance: v.optional(v.string()),
    relatedCharacters: v.optional(v.array(v.id("characters"))),
    relatedLocations: v.optional(v.array(v.id("locations"))),
    // AI Generation
    aiPrompt: v.optional(v.string()),
    // Metadata
    firstAppearance: v.optional(v.id("chapters")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_story", ["storyId"])
    .index("by_author", ["authorId"])
    .index("by_type", ["type"])
    .index("by_story_type", ["storyId", "type"])
    .searchIndex("search_elements", {
      searchField: "name",
      filterFields: ["storyId", "type"],
    }),

  // Chapter References - Track which characters/locations/elements appear in which chapters
  chapterReferences: defineTable({
    chapterId: v.id("chapters"),
    storyId: v.id("stories"),
    // Reference type and ID
    referenceType: v.union(
      v.literal("character"),
      v.literal("location"),
      v.literal("element")
    ),
    referenceId: v.string(),
    // Usage details
    panelNumbers: v.optional(v.array(v.number())),
    notes: v.optional(v.string()),
    importance: v.optional(v.union(
      v.literal("major"),
      v.literal("minor"),
      v.literal("mention")
    )),
    createdAt: v.number(),
  })
    .index("by_chapter", ["chapterId"])
    .index("by_story", ["storyId"])
    .index("by_reference_type", ["referenceType"])
    .index("by_chapter_type", ["chapterId", "referenceType"]),

  // Likes
  likes: defineTable({
    userId: v.id("users"),
    targetType: v.union(v.literal("story"), v.literal("chapter"), v.literal("comment")),
    storyId: v.optional(v.id("stories")),
    chapterId: v.optional(v.id("chapters")),
    commentId: v.optional(v.id("comments")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_story", ["storyId"])
    .index("by_chapter", ["chapterId"])
    .index("by_user_story", ["userId", "storyId"])
    .index("by_user_chapter", ["userId", "chapterId"])
    .index("by_user_target", ["userId", "targetType"]),

  // Favorites/Bookmarks
  favorites: defineTable({
    userId: v.id("users"),
    storyId: v.id("stories"),
    // Custom collections
    collectionName: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_story", ["storyId"])
    .index("by_user_story", ["userId", "storyId"])
    .index("by_user_collection", ["userId", "collectionName"]),

  // Reading progress
  readingProgress: defineTable({
    userId: v.id("users"),
    storyId: v.id("stories"),
    chapterId: v.id("chapters"),
    // Progress tracking
    lastReadChapterNumber: v.number(),
    lastReadPosition: v.optional(v.number()), // Panel index or scroll position
    progressPercentage: v.number(),
    completedChapters: v.array(v.id("chapters")),
    // Metadata
    lastReadAt: v.number(),
    totalReadingTimeMinutes: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_story", ["storyId"])
    .index("by_user_story", ["userId", "storyId"])
    .index("by_user_updated", ["userId", "updatedAt"]),

  // Comments
  comments: defineTable({
    userId: v.id("users"),
    content: v.string(),
    // Target
    targetType: v.union(v.literal("story"), v.literal("chapter")),
    storyId: v.id("stories"),
    chapterId: v.optional(v.id("chapters")),
    // Replies
    parentCommentId: v.optional(v.id("comments")),
    replyCount: v.number(),
    // Stats
    likeCount: v.number(),
    // Moderation
    isEdited: v.boolean(),
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_story", ["storyId"])
    .index("by_chapter", ["chapterId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentCommentId"])
    .index("by_story_created", ["storyId", "createdAt"])
    .index("by_chapter_created", ["chapterId", "createdAt"]),

  // Follows (users following users)
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_follower_following", ["followerId", "followingId"]),

  // Story subscriptions (users subscribing to story updates)
  subscriptions: defineTable({
    userId: v.id("users"),
    storyId: v.id("stories"),
    notifyOnNewChapter: v.boolean(),
    notifyOnComment: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_story", ["storyId"])
    .index("by_user_story", ["userId", "storyId"]),

  // AI Generation requests
  generations: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("story"),
      v.literal("chapter"),
      v.literal("panel"),
      v.literal("cover")
    ),
    // Request details
    prompt: v.string(),
    parameters: v.object({
      genre: v.optional(v.string()),
      style: v.optional(v.string()),
      length: v.optional(v.string()),
      model: v.optional(v.string()),
    }),
    // Results
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    statusMessage: v.optional(v.string()),
    generatedText: v.optional(v.string()),
    generatedImageUrl: v.optional(v.string()),
    generatedImageStorageId: v.optional(v.id("_storage")),
    // Metadata
    modelUsed: v.optional(v.string()),
    processingTimeMs: v.optional(v.number()),
    cost: v.optional(v.number()),
    // Links
    storyId: v.optional(v.id("stories")),
    chapterId: v.optional(v.id("chapters")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_story", ["storyId"])
    .index("by_user_status", ["userId", "status"]),

  // Usage tracking for credits/billing
  usage: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    operations: v.object({
      storyGeneration: v.number(),
      chapterGeneration: v.number(),
      imageGeneration: v.number(),
      totalGenerations: v.number(),
    }),
    costs: v.object({
      total: v.number(),
      breakdown: v.object({
        stories: v.number(),
        chapters: v.number(),
        images: v.number(),
      }),
    }),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_user_date", ["userId", "date"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("new_chapter"),
      v.literal("new_comment"),
      v.literal("new_like"),
      v.literal("new_follower"),
      v.literal("story_completed"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    // Links
    storyId: v.optional(v.id("stories")),
    chapterId: v.optional(v.id("chapters")),
    commentId: v.optional(v.id("comments")),
    fromUserId: v.optional(v.id("users")),
    // Status
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_type", ["type"]),

  // Collections (curated story collections)
  collections: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    creatorId: v.id("users"),
    coverImageUrl: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    // Collection metadata
    isPublic: v.boolean(),
    isFeatured: v.boolean(),
    storyCount: v.number(),
    followerCount: v.number(),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_public", ["isPublic"])
    .index("by_featured", ["isFeatured"])
    .searchIndex("search_collections", {
      searchField: "name",
      filterFields: ["creatorId", "isPublic"],
    }),

  // Collection items (stories in collections)
  collectionItems: defineTable({
    collectionId: v.id("collections"),
    storyId: v.id("stories"),
    order: v.number(),
    addedBy: v.id("users"),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_collection", ["collectionId"])
    .index("by_story", ["storyId"])
    .index("by_collection_order", ["collectionId", "order"]),

  // Reports (content moderation)
  reports: defineTable({
    reporterId: v.id("users"),
    targetType: v.union(
      v.literal("story"),
      v.literal("chapter"),
      v.literal("comment"),
      v.literal("user")
    ),
    targetId: v.string(),
    storyId: v.optional(v.id("stories")),
    chapterId: v.optional(v.id("chapters")),
    commentId: v.optional(v.id("comments")),
    reportedUserId: v.optional(v.id("users")),
    reason: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    resolution: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_reporter", ["reporterId"])
    .index("by_status", ["status"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_reviewed", ["reviewedBy"]),
});
