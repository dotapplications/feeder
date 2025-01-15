import { z } from "genkit";
import { ai } from "../../genkit_init";
import {
  getEntityMemory,
  getExperienceMemory,
  getPersonalityMemory,
  getReflectionsMemory,
} from "../settings_api/memory_invocation_tools";

export const learnEntity = ai.definePrompt(
  {
    name: "learning_agent",
    tools: [
      getPersonalityMemory,
      getEntityMemory,
      getReflectionsMemory,
      getExperienceMemory,
    ],
    output: {
      schema: z.object({
        learnings: z
          .array(z.string())
          .describe("Learnings from the content you got"),
      }),
    },
  },

  `{{role "system"}} You will learn the content users sent`
);
