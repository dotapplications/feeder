import { chunk } from "llm-chunk";

import { converttxtintoText } from "../extract_text";
import { ai } from "../genkit_init";
import { run } from "../taskRunner";
import { Document } from "genkit/retriever";
import { z } from "genkit";
import { experience_indexer, reflections_memory_retriver } from "./init_memory";
import { chunkingConfig } from "../utils";

export const index_experience = ai.defineFlow(
  {
    name: "embed_experience_memory",
    inputSchema: z
      .string()
      .describe("you are giving the file path of txt file"),
    outputSchema: z.void(),
  },

  async (filePath: string) => {
    // Read the pdf.
  }
);
export const indexExperienceMemory = async (content: string) => {
  const chunks = await run("chunk-it", async () =>
    chunk(content, chunkingConfig)
  );

  // Convert chunks of text into documents to store in the index.
  const documents = chunks.map((text) => {
    return Document.fromText(text, { content });
  });
  await ai.index({ indexer: experience_indexer, documents });
};

export const retriveExperienceMemory = async (
  user_input: string
): Promise<Document[]> => {
  const reflectionsDoc = await ai.retrieve({
    retriever: reflections_memory_retriver,
    query: user_input,
    options: { k: 3 },
  });

  return reflectionsDoc;
};
