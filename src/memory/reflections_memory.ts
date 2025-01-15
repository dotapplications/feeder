import { chunk } from "llm-chunk";
import { ai } from "../genkit_init";
import { run } from "../taskRunner";
import { Document } from "genkit/retriever";
import { chromaRetrieverRef } from "genkitx-chromadb";
import { chromaIndexerRef } from "genkitx-chromadb";
import { z } from "genkit";
import {
  reflections_indexer,
  reflections_memory_retriver,
} from "./init_memory";
import { chunkingConfig } from "../utils";
import { admin, firestore } from "../firebase/firebase_admin";
import { textEmbedding004 } from "@genkit-ai/vertexai";
import { defineFirestoreRetriever } from "@genkit-ai/firebase";

// import { ChromaClient } from "chromadb";
// const client = new ChromaClient();

export const index_reflections = ai.defineFlow(
  {
    name: "embed_reflections_memory",
    inputSchema: z
      .string()
      .describe("you are giving the file path of txt file"),
    outputSchema: z.void(),
  },
  async (content: string) => {}
);

// export const retriveReflections = ai.defineFlow(
//   {
//     name: "retrive_reflections_memory",
//     inputSchema: z
//       .string()
//       .describe("you are giving the file path of txt file"),
//     outputSchema: z.void(),
//   },
//   async (content: string) => {
//     const docs = await ai.retrieve({
//       retriever: bobFactsRetriever,
//       query: content,
//     });
//     console.log(JSON.stringify(docs));
//   }
// );

export const indexReflectionsMemory = async (content: string) => {
  const chunks = await run("chunk-it", async () =>
    chunk(content, chunkingConfig)
  );

  // Convert chunks of text into documents to store in the index.
  const documents = chunks.map((text) => {
    return Document.fromText(text, { content });
  });
  await ai.index({ indexer: reflections_indexer, documents });
};

export const retriveReflectionsMemory = async (
  user_input: string
): Promise<Document[]> => {
  const personalityDoc = await ai.retrieve({
    retriever: reflections_memory_retriver,
    query: user_input,
    options: { k: 3 },
  });

  return personalityDoc;
};

// export const retriveReflectionsMemory = async (
//   user_input: string
// ): Promise<Document[]> => {
//   // First, get the embedding for the query

//   try {
//     const docs = await ai.retrieve({
//       retriever,
//       query: user_input,
//       options: {
//         limit: 5, // Options: Return up to 5 documents
//       },
//     });
//     console.log(JSON.stringify(docs));
//     return docs;
//   } catch (e) {
//     console.log(e);
//   }
// };

// Add this type to help TypeScript understand the structure
interface ReflectionDocument {
  text: string;
  embedding: number[];
  timestamp: FirebaseFirestore.Timestamp;
}

// async function indexToFirestore(data: string[]) {
//   const batch = firestore.batch();
//   const promises = [];

//   for (const text of data) {
//     const docRef = firestore.collection(indexConfig.collection).doc();
//     const embedding = await ai.embed({
//       embedder: indexConfig.embedder,
//       content: text,
//     });

//     // Store embedding as a regular array
//     promises.push(
//       docRef.set({
//         [indexConfig.vectorField]: embedding, // Store as regular array
//         [indexConfig.contentField]: text,
//         timestamp: admin.firestore.FieldValue.serverTimestamp(),
//       })
//     );
//   }

//   // Wait for all embeddings to be generated
//   await Promise.all(promises);
// }

// const retriever = defineFirestoreRetriever(ai, {
//   name: indexConfig.collection,
//   firestore,
//   collection: indexConfig.collection,
//   contentField: indexConfig.contentField, // Field containing document content
//   vectorField: indexConfig.vectorField, // Field containing vector embeddings
//   embedder: indexConfig.embedder, // Embedder to generate embeddings
//   distanceMeasure: "COSINE", // Default is 'COSINE'; other options: 'EUCLIDEAN', 'DOT_PRODUCT'
// });

// const indexConfig = {
//   collection: "reflections_memory",
//   contentField: "text",
//   vectorField: "embedding",
//   embedder: textEmbedding004,
// };
