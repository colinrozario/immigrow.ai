import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get user's deadlines
 */
export const getUserDeadlines = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("deadlines"),
      _creationTime: v.number(),
      userId: v.id("users"),
      documentId: v.optional(v.id("documents")),
      title: v.string(),
      description: v.string(),
      dueDate: v.string(),
      importance: v.union(
        v.literal("critical"),
        v.literal("important"),
        v.literal("info")
      ),
      completed: v.boolean(),
      reminderSent: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const deadlines = await ctx.db
      .query("deadlines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Sort by due date
    return deadlines.sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  },
});

/**
 * Toggle deadline completion
 */
export const toggleDeadlineCompletion = mutation({
  args: { deadlineId: v.id("deadlines") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const deadline = await ctx.db.get(args.deadlineId);
    if (!deadline || deadline.userId !== userId) {
      throw new Error("Deadline not found");
    }

    await ctx.db.patch(args.deadlineId, {
      completed: !deadline.completed,
    });

    return null;
  },
});

/**
 * Create custom deadline
 */
export const createDeadline = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    dueDate: v.string(),
    importance: v.union(
      v.literal("critical"),
      v.literal("important"),
      v.literal("info")
    ),
  },
  returns: v.id("deadlines"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("deadlines", {
      userId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      importance: args.importance,
      completed: false,
      reminderSent: false,
    });
  },
});

/**
 * Delete deadline
 */
export const deleteDeadline = mutation({
  args: { deadlineId: v.id("deadlines") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const deadline = await ctx.db.get(args.deadlineId);
    if (!deadline || deadline.userId !== userId) {
      throw new Error("Deadline not found");
    }

    await ctx.db.delete(args.deadlineId);
    return null;
  },
});
