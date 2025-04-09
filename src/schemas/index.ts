import { z } from "zod";

// Note: For file uploads, validation is now handled by multer middleware
// This schema is kept for reference and potential future use
export const embedDocumentSchema = z.object({
  body: z.object({
  }),
});

export const generateResponseSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt is too long"),
  }),
});
