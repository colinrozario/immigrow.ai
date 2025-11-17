"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Analyze document with Gemini AI
 */
export const analyzeDocument = internalAction({
  args: { documentId: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await ctx.runQuery(internal.documentsInternal.getDocumentInternal, {
      documentId: args.documentId,
    });

    if (!document) {
      throw new Error("Document not found");
    }

    try {
      // Get file from storage
      const fileUrl = await ctx.storage.getUrl(document.fileId);
      if (!fileUrl) {
        throw new Error("File not found");
      }

      // Fetch file content
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      // @ts-ignore - Buffer is available in Node.js runtime
      const base64 = Buffer.from(buffer).toString("base64");

      // Initialize Gemini
      // @ts-ignore - process.env is available in Node.js runtime
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Create prompt based on document type
      const prompt = getAnalysisPrompt(document.type);

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: blob.type,
            data: base64,
          },
        },
        prompt,
      ]);

      const analysisText = result.response.text();
      const analysis = parseAnalysisResult(analysisText, document.type);

      // Save analysis result
      await ctx.runMutation(internal.documentsInternal.saveAnalysisResult, {
        documentId: args.documentId,
        analysis,
      });

      // Create deadlines from key dates
      await ctx.runMutation(internal.documentsInternal.createDeadlinesFromAnalysis, {
        documentId: args.documentId,
        userId: document.userId,
        keyDates: analysis.keyDates,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      await ctx.runMutation(internal.documentsInternal.markAnalysisFailed, {
        documentId: args.documentId,
      });
    }

    return null;
  },
});

// Helper functions
function getAnalysisPrompt(docType: "I-94" | "I-20" | "H-1B"): string {
  const basePrompt = `Analyze this immigration document and extract key information. Return your response in the following JSON format:
{
  "summary": "Brief 2-3 sentence summary of the document",
  "keyDates": [
    {
      "label": "Date description",
      "date": "YYYY-MM-DD",
      "importance": "critical|important|info"
    }
  ],
  "nextSteps": ["Step 1", "Step 2", "Step 3"],
  "warnings": ["Warning 1", "Warning 2"],
  "details": {
    // Document-specific fields
  }
}`;

  switch (docType) {
    case "I-94":
      return `${basePrompt}

For I-94 documents, extract:
- Admission number
- Entry date
- Admit until date (or D/S for duration of status)
- Class of admission (visa type)
- Port of entry
- Any important warnings about status expiration

In the details object, include: admissionNumber, entryDate, admitUntilDate, classOfAdmission, portOfEntry`;

    case "I-20":
      return `${basePrompt}

For I-20 documents, extract:
- SEVIS ID
- Program start and end dates
- School name
- Degree level and major
- OPT/CPT eligibility dates
- Travel signature expiration
- Any important warnings about maintaining F-1 status

In the details object, include: sevisId, schoolName, programStartDate, programEndDate, degreeLevel, major`;

    case "H-1B":
      return `${basePrompt}

For H-1B documents, extract:
- Petition receipt number
- Validity period (start and end dates)
- Employer name
- Job title
- Prevailing wage
- Any important warnings about status maintenance

In the details object, include: receiptNumber, validityStart, validityEnd, employerName, jobTitle`;

    default:
      return basePrompt;
  }
}

function parseAnalysisResult(text: string, _docType: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse JSON:", e);
  }

  // Fallback: create a basic structure
  return {
    summary: text.substring(0, 200) + "...",
    keyDates: [],
    nextSteps: ["Review the document carefully", "Consult with an immigration attorney"],
    warnings: ["Unable to fully parse document. Please review manually."],
    details: { rawText: text },
  };
}
