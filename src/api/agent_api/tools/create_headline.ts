import { z } from "genkit";
import { ai } from "../../../genkit_init";
import {
  getEntityMemory,
  getExperienceMemory,
  getPersonalityMemory,
  getReflectionsMemory,
} from "../../settings_api/memory_invocation_tools";

export const createHeadline = ai.definePrompt(
  {
    name: "createHeadlineAgent",
    description: "You will create news headline to get people notified",
    output: {
      schema: z.object({
        headline: z.string().describe("News headline"),
        activity_summary: z
          .string()
          .describe("summary of the activity")
          .optional(),
        observations: z
          .string()
          .describe("observations from the content")
          .optional(),
      }),
    },
  },
  `{{role "system"}} you will create headlines to sent to the user,`
);
