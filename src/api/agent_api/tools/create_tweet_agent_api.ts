import { z } from "genkit";
import { ai } from "../../../genkit_init";
import {
  getEntityMemory,
  getExperienceMemory,
  getPersonalityMemory,
  getReflectionsMemory,
} from "../../settings_api/memory_invocation_tools";
import { limit } from "@firebase/firestore";

export const createTweet = ai.definePrompt(
  {
    name: "createTweet",
    description:
      "You will create tweet from your knowledge about an topic or token",

    output: {
      schema: z.object({
        tweet: z
          .string()
          .length(180)
          .describe("tweet content should be aligned with the personality,"),

        activity_summary: z
          .string()
          .describe("summary of the activity to store in my experience memory"),
        observation: z
          .string()
          .describe(
            "observations from of the activity to store in my experience memory"
          ),
      }),
    },
  },
  `{{role "system"}} you will create an tweet from your knowledge, make sure it is aligned with the personality about an topic or token, don't use hashtags`
);
