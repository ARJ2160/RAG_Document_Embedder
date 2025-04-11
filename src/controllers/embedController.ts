import type { Request, Response, NextFunction } from "express";
import fs from "fs";

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
    if ((req as any).fileValidationError) {
      throw new AppError((req as any).fileValidationError, 400);
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      throw new AppError("No files were uploaded", 400);
    }

    const uploadedFiles = req.files as Express.Multer.File[];
    logger.info(`Processing ${uploadedFiles.length} uploaded documents`);

    // Initialize services
    const pineconeService = PineconeService.getInstance();
    const openaiService = OpenAIService.getInstance();
    const documentService = DocumentService.getInstance();

    const results = [];

    // Process each file
    for (const uploadedFile of uploadedFiles) {
      logger.info(`Processing file: ${uploadedFile.originalname}`);
      
      // Extract text from document
      const rawText = await documentService.extractTextFromDocument(
        uploadedFile.path
      );

      // Split text into chunks
      const docs = await documentService.splitText(rawText);

      // Create embeddings for document chunks
      const vectors = await openaiService.createEmbeddings(
        docs.map((doc) => doc.pageContent)
      );

      // Create a document ID based on original filename and timestamp
      const documentId = `${Date.now()}-${uploadedFile.originalname.replace(
        /\s+/g,
        "_"
      )}`;

      // Prepare records for Pinecone
      const records = vectors.map((vector, i) => ({
        id: `${documentId}-${i}`,
        values: vector,
        metadata: {
          chunk: docs[i].pageContent,
          source: uploadedFile.originalname,
          chunkIndex: i,
          createdAt: new Date().toISOString(),
        },
      }));

      // Upsert vectors to Pinecone
      await pineconeService.upsertVectors(records);

      logger.info(
        `Successfully embedded document: ${uploadedFile.originalname} with ${records.length} chunks`
      );

      // Delete the uploaded file after successful processing
      try {
        fs.unlinkSync(uploadedFile.path);
        logger.info(`Deleted uploaded file: ${uploadedFile.path}`);
      } catch (deleteError) {
        logger.warn(
          `Failed to delete uploaded file: ${uploadedFile.path}. Error: ${deleteError}`
        );
      }

      // Add result for this file
      results.push({
        filename: uploadedFile.originalname,
        documentId: documentId,
        chunks: records.length,
      });
    }

    res.status(200).json({
      message: `${uploadedFiles.length} document(s) embedded successfully`,
      totalFiles: uploadedFiles.length,
      documents: results,
    });
    return;
  } catch (err: any) {
    if (req.files && Array.isArray(req.files)) {
      const files = req.files as Express.Multer.File[];
      // Clean up all uploaded files in case of error
      for (const file of files) {
        try {
          fs.unlinkSync(file.path);
          logger.info(`Deleted uploaded file after error: ${file.path}`);
        } catch (deleteError) {
          logger.warn(
            `Failed to delete uploaded file after error: ${file.path}`
          );
        }
      }
    }

    logger.error(`Error embedding documents: ${err.message}`);
    next(new AppError(err.message, 500));
    return;
  }
};
