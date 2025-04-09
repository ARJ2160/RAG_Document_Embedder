import fs from "fs";
import path from "path";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
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

  /**
   * Extract text from a document file based on its extension
   * @param filePath Path to the document file
   * @returns Extracted text content
   */
  public async extractTextFromDocument(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }

      const extension = path.extname(filePath).toLowerCase();
      let text = "";

      switch (extension) {
        case ".pdf":
          text = await this.extractTextFromPDF(filePath);
          break;
        case ".docx":
        case ".doc":
          text = await this.extractTextFromWord(filePath);
          break;
        default:
          throw new Error(`Unsupported file extension: ${extension}`);
      }

      logger.info(
        `Extracted ${text.length} characters from document: ${path.basename(filePath)}`
      );
      return text;
    } catch (error) {
      logger.error(`Error extracting text from document: ${error}`);
      throw error;
    }
  }

  private async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      const text = docs.map((doc) => doc.pageContent).join("\n");

      logger.info(
        `Extracted ${text.length} characters from PDF: ${path.basename(filePath)}`
      );
      return text;
    } catch (error) {
      logger.error(`Error extracting text from PDF: ${error}`);
      throw error;
    }
  }

  private async extractTextFromWord(filePath: string): Promise<string> {
    try {
      const loader = new DocxLoader(filePath);
      const docs = await loader.load();
      const text = docs.map((doc) => doc.pageContent).join("\n");

      logger.info(
        `Extracted ${text.length} characters from Word document: ${path.basename(filePath)}`
      );
      return text;
    } catch (error) {
      logger.error(`Error extracting text from Word document: ${error}`);
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

  /**
   * Get the file extension from a file path
   * @param filename Name of the file
   * @returns File extension including the dot (e.g., ".pdf")
   */
  public getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Check if a file is a supported document type
   * @param filename Name of the file
   * @returns Boolean indicating if the file is supported
   */
  public isSupportedDocumentType(filename: string): boolean {
    const supportedExtensions = ['.pdf', '.doc', '.docx'];
    const extension = this.getFileExtension(filename);
    return supportedExtensions.includes(extension);
  }

  public validateFile(filename: string): string {
    try {
      // Sanitize the filename to prevent path traversal attacks
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(process.cwd(), "pdfs", sanitizedFilename);

      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${sanitizedFilename}`);
      }

      if (!this.isSupportedDocumentType(sanitizedFilename)) {
        throw new Error("Only PDF and Word files are supported");
      }

      return filePath;
    } catch (error) {
      logger.error(`Error validating file: ${error}`);
      throw error;
    }
  }
}
