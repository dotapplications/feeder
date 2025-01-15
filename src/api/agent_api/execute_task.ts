import { GenerateResponse, z } from "genkit";
import { ai } from "../../genkit_init";
import { taskSchema } from "../../schemas/task_schema";
import { nestedToolSchema } from "../../schemas/task_schema";
import { toolDefinitions } from "../../config/agent_config";
import { toolDefinisitionsStringified } from "../../utils";
import { retriveAllMemoriesContext } from "../settings_api/memory_invocation_tools";
import { createTweet } from "./tools/create_tweet_agent_api";
import { createHeadline } from "./tools/create_headline";
import { createReflections } from "./tools/update_reflections";
import { updatePersonality } from "./tools/update_personality";
import { readTwitterFeeds } from "./tools/read_tweets";
import { searchTwitter } from "./tools/search_twitter";
import { readGeneralCryptoNews } from "./tools/general_crypto_news_agent";
import { searchGeneralCryptoNews } from "../settings_api/crypto_news";
import { twitter_schema } from "../../schemas/twitter_schema";
import { news_schema } from "../../schemas/news_schema";

export const executeTask = async (
  task: any
): Promise<GenerateResponse<any>> => {
  const currentDate = new Date();

  // const systemPrompt = `
  //   Execute the task:
  //   ${task.title}

  //   Using appropriate tools and sub-tools.
  //   Primary Tool: ${task.tool}
  //   Required Sub-tools: ${task.subTools}

  //   Tool Capabilities and Constraints:
  //   ${toolDefinisitionsStringified()}
  // `;

  const systemPrompt = `
  search general crypto news `;

  // const prompt = `
  //   Task Details: ${JSON.stringify(task)}
  //   Current Time: ${currentDate.toLocaleTimeString()}
  // `;
  console.log("Retriving memory context");
  const memoriesContext = await retriveAllMemoriesContext(`${systemPrompt}\n `);
  console.log("Memory context retrived");

  try {
    const response = await ai.generate({
      tools: [
        createTweet,
        createHeadline,
        readTwitterFeeds,
        searchTwitter,
        searchGeneralCryptoNews,
        createReflections,
        updatePersonality,
      ],
      system: systemPrompt,

      docs: memoriesContext,
      output: {
        schema: news_schema,
      },
    });

    return response;
  } catch (error) {
    console.error(`Error executing task ${task.id}:`, error);
    throw error;
  }
};
