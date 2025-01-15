import { z, Document } from "genkit";
import { ai } from "../../genkit_init";
import { retrivePersonalityMemory } from "../../memory/peronality_memory";
import { retriveEntityMemory } from "../../memory/entity_memory";
import { retriveReflectionsMemory } from "../../memory/reflections_memory";
import { retriveExperienceMemory } from "../../memory/experience_memory";

export const getPersonalityMemory = ai.defineTool(
  {
    name: "getMyPersonality",
    description:
      "Retrieves personality memory of me to respond according to my personality",

    outputSchema: z.string(),
  },
  async (input: any): Promise<string> => {
    console.log("input to personality", input);
    const personalityDoc = await retrivePersonalityMemory(
      JSON.stringify(input)
    );
    console.log("personalityDoc", personalityDoc);
    return `${JSON.stringify(personalityDoc)}`;
  }
);

export const getEntityMemory = ai.defineTool(
  {
    name: "getMyKnowledgeMemory",
    description: "Retrieves agents knowledge memory for a given input.",
    inputSchema: z.any(),
    outputSchema: z.any(),
  },
  async (input: any): Promise<string> => {
    const entityMemoryDoc = await retriveEntityMemory(input);
    return `${JSON.stringify(entityMemoryDoc)}`;
  }
);

export const getExperienceMemory = ai.defineTool(
  {
    name: "getExperienceMemory",
    description: "Retrieves experience memory for a given input.",

    outputSchema: z.string(),
  },
  async (input: string): Promise<string> => {
    console.log("input", input);
    const experienceMemoryDoc = await retriveExperienceMemory(input);
    return `${JSON.stringify(experienceMemoryDoc)}`;
  }
);

export const getReflectionsMemory = ai.defineTool(
  {
    name: "getReflectionsMemory",
    description: "Retrieves reflections memory for a given input.",
    outputSchema: z.string(),
  },
  async (input: string): Promise<string> => {
    const reflectionsMemoryDoc = await retriveReflectionsMemory(input);
    return `${JSON.stringify(reflectionsMemoryDoc)}`;
  }
);

export const retriveAllMemoriesContext = async (
  input: string
): Promise<Document[]> => {
  const personalityMemoryDoc = await retrivePersonalityMemory(input);

  const entityMemoryDoc = await retriveEntityMemory(input);
  const experienceMemoryDoc = await retriveExperienceMemory(input);
  const reflectionsMemoryDoc = await retriveReflectionsMemory(input);

  // combine memory
  const memory = [
    ...personalityMemoryDoc,
    ...entityMemoryDoc,
    ...experienceMemoryDoc,
    ...reflectionsMemoryDoc,
  ];
  return memory;
};
