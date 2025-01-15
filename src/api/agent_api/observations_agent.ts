import { z } from "genkit";
import { ai } from "../../genkit_init";
import {
  getEntityMemory,
  getExperienceMemory,
  getPersonalityMemory,
  getReflectionsMemory,
} from "../settings_api/memory_invocation_tools";

export const createObservations = ai.definePrompt(
  {
    name: "create_reflections",
    tools: [
      getPersonalityMemory,
      getEntityMemory,
      getReflectionsMemory,
      getExperienceMemory,
    ],
    output: {
      schema: z.object({
        observations: z
          .array(z.string())
          .describe("the observations you made from user input"),
        type: z.string().describe("type of reflection you made"),
      }),
    },
  },

  `{{role "system"}} you will be analysing inputs and creating observations `
);
