import { z } from "genkit";
import { ai } from "../../genkit_init";
import {
  createTweetAPI,
  readTwitterHomeTimeline,
  searchAboutaTokenAPI,
  searchTwitterAPI,
} from "../user_api/twitter-eliza";
import { Interface } from "node:readline";
import { query } from "@firebase/firestore";
import { twitter_schema } from "../../schemas/twitter_schema";
import { craftTweetSummary } from "../agent_api/general_memory_agent";

interface SearchTwitter {
  query: string;
}

interface CraftTweet {
  tweet: string;
}

interface SearchToken {
  tokenSymbol: string;
}

export const searchForTopicorProtcol = ai.defineTool(
  {
    name: "searchForTopicorProtcol",
    description:
      "search twitter to find relevent info about an topic or Protocol",
    inputSchema: z.object({
      query: z.string(),
    }),
  },
  async (input: SearchTwitter): Promise<string> => {
    try {
      console.log("calling twitter search API" + input.query);
      var tweetsString = await searchTwitterAPI(input.query);
    } catch (e) {
      console.log(e);
    }

    // var respone = await craftTweetSummary(tweetsString);

    return tweetsString;
  }
);

export const searchTwitterAboutToken = ai.defineTool(
  {
    name: "tokenSearch",

    description:
      "search twitter to find relevent info about an topic or Protocol",
    inputSchema: z.object({
      tokenSymbol: z.string(),
    }),
  },

  async (query: SearchToken): Promise<any> => {
    console.log("calling twitter search token api" + query);
    var tweetsString = await searchAboutaTokenAPI(query.tokenSymbol);

    return tweetsString;
  }
);

export const readTwitterFeed = ai.defineTool(
  {
    name: "checkMyTwitterHomeTimeline",
    description: "Help you read twitter home timeline",
  },
  async () => {
    var tweet_string = await readTwitterHomeTimeline();

    console.log("tweet_string", tweet_string);

    return tweet_string;
  }
);

export const createTweet = ai.defineTool(
  {
    name: "createTweet",
    description: "Tool help you create tweet",
    inputSchema: z.object({
      tweet: z.string(),
    }),
  },
  async (input: CraftTweet): Promise<string> => {
    await createTweetAPI(input.tweet);

    return input.tweet;
  }
);
