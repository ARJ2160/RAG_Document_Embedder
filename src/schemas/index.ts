import { z } from "zod";

export const embedDocumentSchema = z.object({
  body: z.object({
    filename: z
      .string()
      .min(1, "Filename is required")
      .refine((val) => val.endsWith(".pdf"), {
        message: "Only PDF files are supported",
      }),
  }),
});

export const generateResponseSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt is too long"),
  }),
});
