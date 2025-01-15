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
  createTweet,
  readTwitterFeed,
  searchForTopicorProtcol,
  searchTwitterAboutToken,
} from "../../settings_api/twitter_api";
import { twitter_schema } from "../../../schemas/twitter_schema";
import { readTwitterFeeds } from "./read_tweets";

export const searchTwitter = ai.definePrompt(
  {
    name: "searchTwitterAgent",
    description: "Performing twitter search ",

    output: {
      schema: twitter_schema,
    },
    tools: [
      searchForTopicorProtcol,
      searchTwitterAboutToken,

      // getEntityMemory,
      // getReflectionsMemory,
      // getExperienceMemory,
    ],
  },
  `{{role "system"}} Agent Searching twitter for expanding my knowledge about an specific topic, protocol or token`
);
