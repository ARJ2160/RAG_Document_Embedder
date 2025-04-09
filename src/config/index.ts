import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "PINECONE_API_KEY",
  "PINECONE_INDEX_NAME",
  "OPENAI_API_KEY",
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

export default {
  app: {
    port: parseInt(process.env.PORT || "3000", 10),
    env: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY as string,
    indexName: process.env.PINECONE_INDEX_NAME as string,
    maxRetries: parseInt(process.env.PINECONE_MAX_RETRIES || "5", 10),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY as string,
    embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-ada-002",
    chatModel: process.env.CHAT_MODEL || "gpt-4o-mini-2024-07-18",
    temperature: parseFloat(process.env.TEMPERATURE || "0.7"),
  },
  textSplitter: {
    chunkSize: parseInt(process.env.CHUNK_SIZE || "1000", 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || "200", 10),
  },
};
