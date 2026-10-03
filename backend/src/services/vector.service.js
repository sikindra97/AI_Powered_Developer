import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { VoyageAIClient } from "voyageai";

let mongoClient = null;
let vectorStore = null;
// Voyage Embeddings Adapter
class VoyageEmbeddings {
  constructor({
    apiKey,
    model = "voyage-4"
  }) {
    if (!apiKey) {
      throw new Error(
        "VOYAGE_API_KEY is not configured."
      );
    }

    this.client = new VoyageAIClient({
      apiKey
    });

    this.model = model;
  }
  // Embed multiple documents
  async embedDocuments(texts) {
    if (!texts?.length) {
      return [];
    }

    const response =
      await this.client.embed({
        input: texts,
        model: this.model,
        inputType: "document"
      });

    if (!response?.data) {
      throw new Error(
        "Voyage AI returned an invalid embedding response."
      );
    }

    return response.data.map(
      (item) => item.embedding
    );
  }
  // Embed user query
  async embedQuery(text) {
    if (!text?.trim()) {
      throw new Error(
        "Query text is required."
      );
    }

    const response =
      await this.client.embed({
        input: text,
        model: this.model,
        inputType: "query"
      });

    if (
      !response?.data?.[0]?.embedding
    ) {
      throw new Error(
        "Voyage AI returned an invalid query embedding."
      );
    }

    return response.data[0].embedding;
  }
}
// Get Vector Store
const getVectorStore = async () => {
  if (vectorStore) {
    return vectorStore;
  }
  // Environment validation
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is not configured."
    );
  }

  if (!process.env.VOYAGE_API_KEY) {
    throw new Error(
      "VOYAGE_API_KEY is not configured."
    );
  }
  // MongoDB connection
  if (!mongoClient) {
    mongoClient =
      new MongoClient(
        process.env.MONGO_URI
      );

    await mongoClient.connect();

    console.log(
      "MongoDB Vector Client Connected"
    );
  }
  // Database
  const database =
    mongoClient.db(
      process.env.VECTOR_DB_NAME ||
        "ai_developer"
    );
  // Collection
  const collection =
    database.collection(
      process.env.VECTOR_COLLECTION ||
        "code_embeddings"
    );
  // Voyage Embedding Model
  const embeddings =
    new VoyageEmbeddings({
      apiKey:
        process.env.VOYAGE_API_KEY,

      model:
        "voyage-4"
    });
  // MongoDB Vector Store
  vectorStore =
    new MongoDBAtlasVectorSearch(
      embeddings,
      {
        collection,

        indexName:
          process.env.VECTOR_INDEX_NAME ||
          "code_vector_index",

        textKey: "text",

        embeddingKey: "embedding"
      }
    );

  return vectorStore;
};

export default getVectorStore;