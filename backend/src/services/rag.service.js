import crypto from "crypto";

import {
  RecursiveCharacterTextSplitter
} from "@langchain/textsplitters";

import { Document } from "@langchain/core/documents";

import getVectorStore from "./vector.service.js";

const textSplitter =
  new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 200
  });

const generateCodeHash = (code) => {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
};

const normalizeFilePath = (filePath) => {
  if (!filePath) {
    return "";
  }

  return String(filePath)
    .trim()
    .replace(/**\\\\**/g, "/");
};

const indexCodeFile = async ({
  userId,
  repositoryId,
  filePath,
  language,
  code
}) => {
  if (!code?.trim()) {
    throw new Error(
      "Code is required for indexing."
    );
  }

  if (!userId) {
    throw new Error(
      "User ID is required for indexing."
    );
  }

  if (!repositoryId) {
    throw new Error(
      "Repository ID is required for indexing."
    );
  }

  if (!filePath?.trim()) {
    throw new Error(
      "File path is required for indexing."
    );
  }

  const normalizedFilePath =
    normalizeFilePath(filePath);

  const vectorStore =
    await getVectorStore();

  const codeHash =
    generateCodeHash(code);

  const chunks =
    await textSplitter.splitText(code);

  if (!chunks.length) {
    return {
      indexed: false,
      filePath:
        normalizedFilePath,
      chunksIndexed: 0
    };
  }

  const documents =
    chunks.map(
      (chunk, index) =>
        new Document({
          pageContent: chunk,
          metadata: {
            userId:
              String(userId),
            repositoryId:
              String(repositoryId),
            filePath:
              normalizedFilePath,
            language:
              language || "Unknown",
            chunkIndex:
              index,
            codeHash,
            type: "code"
          }
        })
    );

  await vectorStore.addDocuments(
    documents
  );

  return {
    indexed: true,
    filePath:
      normalizedFilePath,
    chunksIndexed:
      documents.length,
    codeHash
  };
};

const retrieveRelevantCode = async ({
  question,
  userId,
  repositoryId,
  filePath,
  k = 5
}) => {
  if (!question?.trim()) {
    return [];
  }

  if (!userId) {
    throw new Error(
      "User ID is required for retrieval."
    );
  }

  if (!repositoryId) {
    throw new Error(
      "Repository ID is required for retrieval."
    );
  }

  const normalizedFilePath =
    normalizeFilePath(filePath);

  const vectorStore =
    await getVectorStore();

  const preFilter = {
    userId: {
      $eq: String(userId)
    },
    repositoryId: {
      $eq: String(repositoryId)
    }
  };

  const candidateLimit =
    normalizedFilePath
      ? Math.max(k * 10, 50)
      : k;

  const candidates =
    await vectorStore.similaritySearch(
      question,
      candidateLimit,
      {
        preFilter
      }
    );

  let documents =
    candidates;

  if (normalizedFilePath) {
    documents =
      candidates.filter(
        (document) => {
          const documentPath =
            normalizeFilePath(
              document.metadata?.filePath
            );

          return (
            documentPath ===
            normalizedFilePath
          );
        }
      );
  }

  documents =
    documents.slice(0, k);

  return documents;
};

const buildRagContext = (
  documents = []
) => {
  if (!documents.length) {
    return "";
  }

  return documents
    .map(
      (document, index) => {
        const filePath =
          document.metadata?.filePath ||
          "Unknown file";

        const language =
          document.metadata?.language ||
          "Unknown";

        const chunkIndex =
          document.metadata?.chunkIndex ??
          index;

        return `
========== Selected File Context ${index + 1} ==========

File:
${filePath}

Language:
${language}

Chunk:
${chunkIndex}

Code:
${document.pageContent}

=========================================================
`;
      }
    )
    .join("\n");
};

const buildSources = (
  documents = []
) => {
  if (!documents.length) {
    return [];
  }

  return documents.map(
    (document) => ({
      filePath:
        document.metadata?.filePath ||
        "Unknown",
      language:
        document.metadata?.language ||
        "Unknown",
      chunkIndex:
        document.metadata?.chunkIndex ??
        0
    })
  );
};

export {
  indexCodeFile,
  retrieveRelevantCode,
  buildRagContext,
  buildSources
};