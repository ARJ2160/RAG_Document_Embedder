import { Pinecone, type PineconeRecord } from "@pinecone-database/pinecone";

import config from "../config";
import logger from "../utils/logger";

export class PineconeService {
  private static instance: PineconeService;
  private client: Pinecone;
  private indexName: string;

  private constructor() {
    this.client = new Pinecone({
      apiKey: config.pinecone.apiKey,
      maxRetries: config.pinecone.maxRetries,
    });
    this.indexName = config.pinecone.indexName;
    logger.info(`Initialized Pinecone service with index: ${this.indexName}`);
  }

  public static getInstance(): PineconeService {
    if (!PineconeService.instance) {
      PineconeService.instance = new PineconeService();
    }
    return PineconeService.instance;
  }

  public async getIndex() {
    try {
      return this.client.index(this.indexName);
    } catch (error) {
      logger.error(`Error getting Pinecone index: ${error}`);
      throw error;
    }
  }

  public async upsertVectors(records: PineconeRecord[]) {
    try {
      const index = await this.getIndex();
      await index.upsert(records);
      logger.info(`Upserted ${records.length} vectors to Pinecone`);
    } catch (error) {
      logger.error(`Error upserting vectors: ${error}`);
      throw error;
    }
  }

  public async queryVectors(vector: number[], topK: number = 3) {
    try {
      const index = await this.getIndex();
      const queryResult = await index.query({
        vector,
        topK,
        includeMetadata: true,
      });
      logger.info(
        `Retrieved ${queryResult.matches?.length || 0} matching documents`
      );
      return queryResult;
    } catch (error) {
      logger.error(`Error querying vectors: ${error}`);
      throw error;
    }
  }
}
