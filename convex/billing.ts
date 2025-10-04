import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// Get user's credit balance
export const getCredits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!credits) {
      // Initialize credits for new user
      return {
        balance: 100, // Free starter credits
        totalEarned: 100,
        totalSpent: 0,
      };
    }

    return credits;
  },
});

// Get user's MangaCoin balance
export const getMangaCoins = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const coins = await ctx.db
      .query("mangaCoins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!coins) {
      // Initialize coins for new user
      return {
        balance: 50, // Free starter coins
        totalEarned: 50,
        totalSpent: 0,
      };
    }

    return coins;
  },
});

// Get credit transaction history
export const getCreditTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 50);

    return transactions;
  },
});

// Get MangaCoin transaction history
export const getCoinTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const transactions = await ctx.db
      .query("coinTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 50);

    return transactions;
  },
});

// Get purchase history
export const getPurchases = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.status) {
      const status = args.status;
      query = ctx.db
        .query("purchases")
        .withIndex("by_user_status", (q) => 
          q.eq("userId", userId).eq("status", status)
        );
    }

    const purchases = await query.order("desc").take(100);
    return purchases;
  },
});

// Get available packages
export const getPackages = query({
  args: {
    type: v.union(v.literal("credits"), v.literal("mangacoins")),
  },
  handler: async (ctx, args) => {
    const packages = await ctx.db
      .query("packages")
      .withIndex("by_type_active", (q) => 
        q.eq("type", args.type).eq("active", true)
      )
      .collect();

    return packages.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

// Initialize user credits/coins (called on signup)
export const initializeWallet = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if already initialized
    const existingCredits = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingCredits) {
      await ctx.db.insert("credits", {
        userId,
        balance: 100,
        totalEarned: 100,
        totalSpent: 0,
        lastUpdated: Date.now(),
      });

      await ctx.db.insert("creditTransactions", {
        userId,
        type: "bonus",
        amount: 100,
        balanceBefore: 0,
        balanceAfter: 100,
        description: "Welcome bonus credits",
        createdAt: Date.now(),
      });
    }

    const existingCoins = await ctx.db
      .query("mangaCoins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingCoins) {
      await ctx.db.insert("mangaCoins", {
        userId,
        balance: 50,
        totalEarned: 50,
        totalSpent: 0,
        lastUpdated: Date.now(),
      });

      await ctx.db.insert("coinTransactions", {
        userId,
        type: "bonus",
        amount: 50,
        balanceBefore: 0,
        balanceAfter: 50,
        description: "Welcome bonus coins",
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Simulate purchase (in production, this would integrate with payment provider)
export const purchasePackage = mutation({
  args: {
    packageId: v.id("packages"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const pkg = await ctx.db.get(args.packageId);
    if (!pkg || !pkg.active) {
      throw new Error("Package not available");
    }

    // Create purchase record
    const purchaseId = await ctx.db.insert("purchases", {
      userId,
      type: pkg.type,
      packageId: args.packageId,
      packageName: pkg.name,
      amount: pkg.amount + (pkg.bonus || 0),
      price: pkg.price,
      currency: pkg.currency,
      status: "completed", // In production: start as "pending"
      paymentProvider: "demo",
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    // Update balance
    if (pkg.type === "credits") {
      const credits = await ctx.db
        .query("credits")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      const currentBalance = credits?.balance || 0;
      const totalAmount = pkg.amount + (pkg.bonus || 0);
      const newBalance = currentBalance + totalAmount;

      if (credits) {
        await ctx.db.patch(credits._id, {
          balance: newBalance,
          totalEarned: credits.totalEarned + totalAmount,
          lastUpdated: Date.now(),
        });
      }

      await ctx.db.insert("creditTransactions", {
        userId,
        type: "purchase",
        amount: totalAmount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: `Purchased ${pkg.name}`,
        metadata: { purchaseId: purchaseId },
        createdAt: Date.now(),
      });
    } else {
      const coins = await ctx.db
        .query("mangaCoins")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      const currentBalance = coins?.balance || 0;
      const totalAmount = pkg.amount + (pkg.bonus || 0);
      const newBalance = currentBalance + totalAmount;

      if (coins) {
        await ctx.db.patch(coins._id, {
          balance: newBalance,
          totalEarned: coins.totalEarned + totalAmount,
          lastUpdated: Date.now(),
        });
      }

      await ctx.db.insert("coinTransactions", {
        userId,
        type: "purchase",
        amount: totalAmount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: `Purchased ${pkg.name}`,
        metadata: { purchaseId: purchaseId },
        createdAt: Date.now(),
      });
    }

    return { success: true, purchaseId };
  },
});

