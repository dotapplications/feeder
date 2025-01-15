import { z } from "genkit";
import { ai } from "../../../genkit_init";

export const updatePersonality = ai.definePrompt(
  {
    name: "reviewMyPersonality",
    description: "Agent for reviewing personality",
    output: {
      schema: z.object({
        updated_personality: z.string().describe("personality improvment"),
      }),
    },
  },

  `{{role "system"}} you will be reviewing personality`
);
