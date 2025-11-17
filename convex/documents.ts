import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

/**
 * Generate upload URL for document
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Create document record after upload
 */
export const createDocument = mutation({
  args: {
    type: v.union(v.literal("I-94"), v.literal("I-20"), v.literal("H-1B")),
    fileName: v.string(),
    fileId: v.id("_storage"),
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const documentId = await ctx.db.insert("documents", {
      userId,
      type: args.type,
      fileName: args.fileName,
      fileId: args.fileId,
      uploadedAt: Date.now(),
      status: "processing",
    });

    // Schedule AI analysis
    await ctx.scheduler.runAfter(0, internal.documentsActions.analyzeDocument, {
      documentId,
    });

    return documentId;
  },
});

/**
 * Get user's documents
 */
export const getUserDocuments = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("documents"),
      _creationTime: v.number(),
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
      analysisResult: v.optional(
        v.object({
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
        })
      ),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return documents;
  },
});

/**
 * Get single document
 */
export const getDocument = query({
  args: { documentId: v.id("documents") },
  returns: v.union(
    v.object({
      _id: v.id("documents"),
      _creationTime: v.number(),
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
      analysisResult: v.optional(
        v.object({
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
        })
      ),
      fileUrl: v.union(v.string(), v.null()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== userId) {
      return null;
    }

    const fileUrl = await ctx.storage.getUrl(document.fileId);

    return {
      ...document,
      fileUrl,
    };
  },
});


