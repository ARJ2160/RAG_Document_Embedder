# RAG Document Embedder

A Retrieval-Augmented Generation (RAG) application backend that allows you to upload documents (PDF, Word), extract their content, create embeddings, store them in Pinecone DB, and query the knowledge base using natural language.

## Features

- **Document Upload**: Upload PDF and Word documents via API
- **Text Extraction**: Automatically extract text from various document formats
- **Vector Embeddings**: Generate embeddings using OpenAI's models
- **Vector Storage**: Store document embeddings in Pinecone for efficient retrieval
- **Natural Language Querying**: Ask questions about your documents in natural language
- **Auto Cleanup**: Uploaded files are automatically deleted after processing

## Technologies

- **Backend**: Node.js with Express.js and TypeScript
- **Document Processing**: LangChain.js for PDF and Word document processing
- **Vector Database**: Pinecone for storing and retrieving embeddings
- **AI Models**: OpenAI for generating embeddings and responses
- **Runtime**: Bun for fast JavaScript/TypeScript execution

## Prerequisites

- Node.js 18+ or Bun 1.0+
- OpenAI API key
- Pinecone API key and index

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
PORT=4000
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
PINECONE_ENVIRONMENT=your_pinecone_environment
```

## Installation

```bash
# Install dependencies
bun install
```

## Running the Server

```bash
# Development mode
bun run dev

# Production mode
bun run start
```

## API Endpoints

### Upload and Embed Document

```
POST /api/embed
```

**Request Format**: Form data with a file field named "document"

**Supported Formats**: PDF (.pdf), Word documents (.doc, .docx)

**Response**:
```json
{
  "message": "Document embedded successfully",
  "chunks": 8,
  "filename": "example.pdf",
  "documentId": "1234567890-example_pdf"
}
```

### Query Documents

```
POST /api/prompt
```

**Request Format**:
```json
{
  "prompt": "What does the document say about X?"
}
```

**Response**:
```json
{
  "response": "Based on the documents, X is...",
  "sources": [
    {
      "text": "Excerpt from document...",
      "source": "example.pdf"
    }
  ]
}
```

## Acknowledgements

This project uses the following open-source packages:
- LangChain.js
- Pinecone SDK
- OpenAI API
