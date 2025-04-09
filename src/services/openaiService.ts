import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import config from "../config";
import logger from "../utils/logger";

export class OpenAIService {
  private static instance: OpenAIService;
  private embeddings: OpenAIEmbeddings;
  private chatModel: ChatOpenAI;

  private constructor() {
    this.embeddings = new OpenAIEmbeddings({
      model: config.openai.embeddingModel,
    });
    
    this.chatModel = new ChatOpenAI({
      model: config.openai.chatModel,
      temperature: config.openai.temperature,
    });
    
    logger.info(`Initialized OpenAI service with embedding model: ${config.openai.embeddingModel} and chat model: ${config.openai.chatModel}`);
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async createEmbedding(text: string): Promise<number[]> {
    try {
      const embedding = await this.embeddings.embedQuery(text);
      logger.debug("Created embedding for text");
      return embedding;
    } catch (error) {
      logger.error(`Error creating embedding: ${error}`);
      throw error;
    }
  }

  public async createEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddings = await this.embeddings.embedDocuments(texts);
      logger.debug(`Created embeddings for ${texts.length} texts`);
      return embeddings;
    } catch (error) {
      logger.error(`Error creating embeddings: ${error}`);
      throw error;
    }
  }

  public async generateResponse(prompt: string, context: string): Promise<string> {
    try {
      const systemPrompt = `You are a helpful assistant. Use the following context to answer the user's question. 
      If you don't know the answer based on the context, say "I don't have enough information to answer that." 
      Do not make up information.
      
      Context: ${context}`;

      const response = await this.chatModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(prompt),
      ]);
      
      logger.debug(`Generated response for prompt: "${prompt.substring(0, 30)}..."`);
      return response.content as string;
    } catch (error) {
      logger.error(`Error generating response: ${error}`);
      throw error;
    }
  }
}
