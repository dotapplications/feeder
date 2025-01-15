import { z } from "genkit";
import { ai } from "../../../genkit_init";
import {
  getEntityMemory,
  getExperienceMemory,
  getPersonalityMemory,
  getReflectionsMemory,
} from "../../settings_api/memory_invocation_tools";

export const createReflections = ai.definePrompt(
  {
    name: "creaftReflectionsAgent",
    description:
      "Agent will crafting reflections based on your past activities and observations and all",
    tools: [],
    output: {
      schema: z.object({
        reflections: z.array(z.string()).describe("the reflections you made"),
      }),
    },
  },

  `{{role "system"}} Agent will crafting reflections based on your past activities and observations, it may be some goal updates, interests or hobbies updates, conclutions about state of the world  `
);
