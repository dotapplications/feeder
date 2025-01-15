import { z } from "genkit";
import { ai } from "../../../genkit_init";
import {
  getEntityMemory,
  getExperienceMemory,
  getPersonalityMemory,
  getReflectionsMemory,
} from "../../settings_api/memory_invocation_tools";
import { limit } from "@firebase/firestore";
// import { searchTwitterAPI } from "src/twitter-eliza";
import {
  readTwitterFeed,
  searchTwitterAboutToken,
} from "../../settings_api/twitter_api";
import { twitter_schema } from "../../../schemas/twitter_schema";

export const readTwitterFeeds = ai.definePrompt(
  {
    name: "readTwitterFeedsAgent",
    description: "Agent will be reading tweeter",
    tools: [readTwitterFeed],
    output: {
      schema: twitter_schema,
    },
  },
  `{{role "system"}} Your agent will be  reading twitter feeds  you must call the checkMyTwitterHomeTimeline tool to get the tweets`
);
