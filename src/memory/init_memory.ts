import {
  devLocalIndexerRef,
  devLocalRetrieverRef,
  devLocalVectorstore,
} from "@genkit-ai/dev-local-vectorstore";
import { textEmbedding004 } from "@genkit-ai/vertexai";
import { chroma, chromaIndexerRef, chromaRetrieverRef } from "genkitx-chromadb";
import dotenv from "dotenv";

dotenv.config();

export const chromeDB = chroma([
  {
    collectionName: "personality_memory",
    createCollectionIfMissing: true,
    embedder: textEmbedding004,
    clientParams: {
      path: process.env.CHROMA_DB_PATH,
    },
  },
  {
    collectionName: "entity_memmory",
    createCollectionIfMissing: true,
    embedder: textEmbedding004,
    clientParams: {
      path: process.env.CHROMA_DB_PATH,
    },
  },

  {
    collectionName: "experience_memory",
    createCollectionIfMissing: true,
    embedder: textEmbedding004,
    clientParams: {
      path: process.env.CHROMA_DB_PATH,
    },
  },
  {
    collectionName: "reflections_memory",
    createCollectionIfMissing: true,
    embedder: textEmbedding004,
    clientParams: {
      path: process.env.CHROMA_DB_PATH,
    },
  },
]);
/// indexers

export const personality_indexer = chromaIndexerRef({
  collectionName: "personality_memory",
});
export const entity_indexer = chromaIndexerRef({
  collectionName: "entity_memmory",
});
export const reflections_indexer = chromaIndexerRef({
  collectionName: "reflections_memory",
});
export const experience_indexer = chromaIndexerRef({
  collectionName: "experience_memory",
});

/// retrivers
export const personality_memory_retriver = chromaRetrieverRef({
  collectionName: "personality_memory",
});
export const entity_memory_retriver = chromaRetrieverRef({
  collectionName: "entity_memmory",
});
export const reflections_memory_retriver = chromaRetrieverRef({
  collectionName: "reflections_memory",
});
export const experience_memory_retriver = chromaRetrieverRef({
  collectionName: "experience_memory",
});

// const retriever = defineFirestoreRetriever(ai, {
//   name: "exampleRetriever",
//   firestore,
//   collection: "documents",
//   contentField: "text", // Field containing document content
//   vectorField: "embedding", // Field containing vector embeddings
//   embedder: yourEmbedderInstance, // Embedder to generate embeddings
//   distanceMeasure: "COSINE", // Default is 'COSINE'; other options: 'EUCLIDEAN', 'DOT_PRODUCT'
// });
// export const reflections_indexer = chromaIndexerRef({
//   collectionName: "reflections_memory",
// });

// export const bobFactsRetriever = chromaRetrieverRef({
//   collectionName: "reflections_memory",
// });
