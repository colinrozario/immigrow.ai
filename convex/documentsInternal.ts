import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get document for internal use
 */
export const getDocumentInternal = internalQuery({
  args: { documentId: v.id("documents") },
  returns: v.union(
    v.object({
      _id: v.id("documents"),
      userId: v.id("users"),
      type: v.union(v.literal("I-94"), v.literal("I-20"), v.literal("H-1B")),
      fileName: v.string(),
      fileId: v.id("_storage"),
      uploadedAt: v.number(),
      status: v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

/**
 * Save analysis result
 */
export const saveAnalysisResult = internalMutation({
  args: {
    documentId: v.id("documents"),
    analysis: v.object({
      summary: v.string(),
      keyDates: v.array(
        v.object({
          label: v.string(),
          date: v.string(),
          importance: v.union(
            v.literal("critical"),
            v.literal("important"),
            v.literal("info")
          ),
        })
      ),
      nextSteps: v.array(v.string()),
      warnings: v.array(v.string()),
      details: v.any(),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      status: "completed",
      analysisResult: args.analysis,
    });
    return null;
  },
});

/**
 * Mark analysis as failed
 */
export const markAnalysisFailed = internalMutation({
  args: { documentId: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      status: "failed",
    });
    return null;
  },
});

/**
 * Create deadlines from analysis
 */
export const createDeadlinesFromAnalysis = internalMutation({
  args: {
    documentId: v.id("documents"),
    userId: v.id("users"),
    keyDates: v.array(
      v.object({
        label: v.string(),
        date: v.string(),
        importance: v.union(
          v.literal("critical"),
          v.literal("important"),
          v.literal("info")
        ),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const keyDate of args.keyDates) {
      await ctx.db.insert("deadlines", {
        userId: args.userId,
        documentId: args.documentId,
        title: keyDate.label,
        description: `Important date from your document`,
        dueDate: keyDate.date,
        importance: keyDate.importance,
        completed: false,
        reminderSent: false,
      });
    }
    return null;
  },
});
