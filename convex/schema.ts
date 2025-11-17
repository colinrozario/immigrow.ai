import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  documents: defineTable({
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
    .index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"]),

  deadlines: defineTable({
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
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "dueDate"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
