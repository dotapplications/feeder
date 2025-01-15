import { chunk } from "llm-chunk";

import { converttxtintoText } from "../extract_text";
import { ai } from "../genkit_init";
import { run } from "../taskRunner";
import { Document } from "genkit/retriever";
import { z } from "genkit";
import { entity_indexer, entity_memory_retriver } from "./init_memory";
import { chunkingConfig } from "../utils";

export const index_crypto_data = ai.defineFlow(
  {
    name: "embed_entity_memory",
    inputSchema: z
      .string()
      .describe("you are giving the file path of txt file"),
    outputSchema: z.void(),
  },
  async (filePath: string) => {
    // Read the pdf.
  }
);
export const indexEntityMemory = async (content: string) => {
  const chunks = await run("chunk-it", async () =>
    chunk(content, chunkingConfig)
  );

  // Convert chunks of text into documents to store in the index.
  const documents = chunks.map((text) => {
    return Document.fromText(text, { content });
  });
  await ai.index({ indexer: entity_indexer, documents });
};

export const retriveEntityMemory = async (
  user_input: string
): Promise<Document[]> => {
  const docs = await ai.retrieve({
    retriever: entity_memory_retriver,
    query: user_input,
    options: { k: 3 },
  });

  return docs;
};
