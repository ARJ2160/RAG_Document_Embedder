import type { Request, Response, NextFunction } from "express";

import { PineconeService } from "../services/pineconeService";
import { OpenAIService } from "../services/openaiService";
import { AppError } from "../middleware/errorHandler";
import logger from "../utils/logger";

export const generateResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      next(new AppError("Prompt is required", 400));
      return;
    }

    logger.info(`Processing prompt request: "${prompt.substring(0, 30)}..."`);

    // Initialize services
    const pineconeService = PineconeService.getInstance();
    const openaiService = OpenAIService.getInstance();

    // Create embedding for the query
    const queryEmbedding = await openaiService.createEmbedding(prompt);

    // Query Pinecone for similar documents
    const queryResponse = await pineconeService.queryVectors(queryEmbedding, 3);

    // Extract context from matched documents
    const contexts =
      queryResponse.matches
        ?.map((match) => match.metadata?.chunk)
        .filter(Boolean) || [];

    if (contexts.length === 0) {
      logger.warn(
        `No relevant documents found for prompt: "${prompt.substring(
          0,
          30
        )}..."`
      );

      res.status(404).json({
        error: "No relevant documents found for this query",
        response: "I don't have enough context to answer that question.",
      });
      return;
    }

    // Combine contexts into a single context string
    const combinedContext = contexts.join("\n\n");

    // Generate response using OpenAI
    const response = await openaiService.generateResponse(
      prompt,
      combinedContext
    );

    logger.info(
      `Successfully generated response for prompt: "${prompt.substring(
        0,
        30
      )}..."`
    );
    res.status(200).json({
      response: response,
      contextUsed: contexts,
    });
  } catch (err: any) {
    logger.error(`Error generating response: ${err.message}`);
    next(new AppError(err.message, 500));
  }
};
