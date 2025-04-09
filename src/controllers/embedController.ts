import type { Request, Response, NextFunction } from "express";

import { PineconeService } from "../services/pineconeService";
import { OpenAIService } from "../services/openaiService";
import { DocumentService } from "../services/documentService";
import { AppError } from "../middleware/errorHandler";
import logger from "../utils/logger";

export const embedDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.body;

    // Initialize services
    const pineconeService = PineconeService.getInstance();
    const openaiService = OpenAIService.getInstance();
    const documentService = DocumentService.getInstance();

    logger.info(`Processing document: ${filename}`);

    // Validate and get file path
    const filePath = documentService.validateFile(filename);

    // Extract text from PDF
    const rawText = await documentService.extractTextFromPDF(filePath);

    // Split text into chunks
    const docs = await documentService.splitText(rawText);

    // Create embeddings for document chunks
    const vectors = await openaiService.createEmbeddings(
      docs.map((doc) => doc.pageContent)
    );

    // Prepare records for Pinecone
    const records = vectors.map((vector, i) => ({
      id: `${filename}-${i}`,
      values: vector,
      metadata: {
        chunk: docs[i].pageContent,
        source: filename,
        chunkIndex: i,
        createdAt: new Date().toISOString(),
      },
    }));

    // Upsert vectors to Pinecone
    await pineconeService.upsertVectors(records);

    logger.info(
      `Successfully embedded document: ${filename} with ${records.length} chunks`
    );
    res.status(200).json({
      message: "Document embedded successfully",
      chunks: records.length,
      filename,
    });
    return;
  } catch (err: any) {
    logger.error(`Error embedding document: ${err.message}`);
    next(new AppError(err.message, 500));
    return;
  }
};
