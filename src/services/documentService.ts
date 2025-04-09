import fs from "fs";
import path from "path";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";

import config from "../config";
import logger from "../utils/logger";

export class DocumentService {
  private static instance: DocumentService;
  private splitter: RecursiveCharacterTextSplitter;

  private constructor() {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.textSplitter.chunkSize,
      chunkOverlap: config.textSplitter.chunkOverlap,
    });

    logger.info(
      `Initialized Document service with chunk size: ${config.textSplitter.chunkSize}, overlap: ${config.textSplitter.chunkOverlap}`
    );
  }

  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  public async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      const text = docs.map((doc) => doc.pageContent).join("\n");

      logger.info(
        `Extracted ${text.length} characters from PDF: ${path.basename(
          filePath
        )}`
      );
      return text;
    } catch (error) {
      logger.error(`Error extracting text from PDF: ${error}`);
      throw error;
    }
  }

  public async splitText(text: string): Promise<Document[]> {
    try {
      const docs = await this.splitter.createDocuments([text]);
      logger.info(`Split text into ${docs.length} chunks`);
      return docs;
    } catch (error) {
      logger.error(`Error splitting text: ${error}`);
      throw error;
    }
  }

  public validateFile(filename: string): string {
    try {
      // Sanitize the filename to prevent path traversal attacks
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(process.cwd(), "pdfs", sanitizedFilename);

      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${sanitizedFilename}`);
      }

      if (!sanitizedFilename.toLowerCase().endsWith(".pdf")) {
        throw new Error("Only PDF files are supported");
      }

      return filePath;
    } catch (error) {
      logger.error(`Error validating file: ${error}`);
      throw error;
    }
  }
}
