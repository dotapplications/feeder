import { ai } from "../genkit_init";
import cron from "node-cron";
import {
  checkIsLoggedIn,
  loginTwitter,
  readTwitterHomeTimeline,
  searchAboutaTokenAPI,
  searchTwitterAPI,
} from "../api/user_api/twitter-eliza";
import {
  getPersonalityMemory,
  retriveAllMemoriesContext,
} from "../api/settings_api/memory_invocation_tools";
import {
  token_searched_schema,
  tweet_schema,
  twitter_schema,
} from "../schemas/twitter_schema";
import { handleAgentResponse } from "./response_modules";
import { GenerateResponse, z } from "genkit";
import { headline_schema } from "../schemas/headline_schema";
import { retriveEntityMemory } from "../memory/entity_memory";
import { retrivePersonalityMemory } from "../memory/peronality_memory";

export const performLearning = async () => {
  await loginTwitter();
  const twitterFeedData = await readTwitterHomeTimeline();
  const systemPrompt =
    "You are an autonomous agent named Feeder, you will be reading twitter feeds below and generate output based on the information you have read";
  const prompt = `${twitterFeedData}`;
  const complete_prompt = `${systemPrompt}\n ${twitterFeedData}`;
  var docs = await retriveAllMemoriesContext(complete_prompt);

  var response = await ai.generate({
    docs: docs,
    system: systemPrompt,
    prompt: prompt,
    output: {
      schema: twitter_schema,
    },
  });

  console.log("Response from agent", response);

  await handleAgentResponse(response);

  // Helper function to add delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Process tokens with a delay

  // if (response.output.tweet_to_reply) {
  //   await replayToAnTweet(
  //     response.output.tweet_to_reply.tweet_id,
  //     response.output.tweet_to_reply.tweet
  //   );
  // }

  // Process tokens with a delay
  for (const token of response.output.tokens_to_track) {
    await performLearningAboutToken(token.token_symbol);
    await delay(60000); // 1 minute delay
  }

  // Process topics with a delay
  for (const topic of response.output.topics_to_track) {
    await performTwitterSearch(topic.topic);
    await delay(60000); // 1 minute delay
  }

  // Process narratives with a delay
  for (const narrative of response.output.narratives_to_track) {
    await performTwitterSearch(narrative.narrative);
    await delay(60000); // 1 minute delay
  }
};

export const replayToAnTweet = async (tweetId: string, tweet: string) => {
  var knowledge = await retriveEntityMemory(tweet);
  var personality = await retrivePersonalityMemory(tweet);

  var system = `Reply to the tweet below use the knowledge from the content ${JSON.stringify(
    knowledge
  )} `;
  var prompt = `tweet: ${tweet} \n use the following context as personality ${JSON.stringify(
    personality
  )}`;

  var response = await ai.generate({
    system: system,
    prompt: prompt,
    output: {
      schema: z.object({
        reply: z.string().describe("less than 280 characters"),
      }),
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);
};

export const performLearningAndTweet = async () => {
  await loginTwitter();
  const twitterFeedData = await readTwitterHomeTimeline();
  const systemPrompt =
    "You are an autonomous agent named Feeder, you will be reading twitter feeds below and generate output based on the information you have read";
  const prompt = `${twitterFeedData}`;
  const complete_prompt = `${systemPrompt}\n ${twitterFeedData}`;
  var docs = await retriveAllMemoriesContext(complete_prompt);

  var response = await ai.generate({
    docs: docs,
    system: systemPrompt,
    prompt: prompt,
    output: {
      schema: twitter_schema,
    },
  });

  console.log("Response from agent", response);

  await handleAgentResponse(response);

  // Helper function to add delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  await createQuestion(twitterFeedData);
  await delay(60000); // 1 minute delay

  await createNewsHealines(twitterFeedData);
  await delay(60000); // 1 minute delay

  await craftingTweetAboutToken(twitterFeedData);
  await delay(60000); // 1 minute delay

  // Process tokens with a delay

  // Process tokens with a delay
  for (const token of response.output.tokens_to_track) {
    await performLearningAboutToken(token.token_symbol);
    await delay(60000); // 1 minute delay
  }

  // Process topics with a delay
  for (const topic of response.output.topics_to_track) {
    await performTwitterSearch(topic.topic);
    await delay(60000); // 1 minute delay
  }

  // Process narratives with a delay
  for (const narrative of response.output.narratives_to_track) {
    await performTwitterSearch(narrative.narrative);
    await delay(60000); // 1 minute delay
  }
};

export const performLearningAboutToken = async (tokenSymbol: string) => {
  await loginTwitter();
  const prompt = await searchAboutaTokenAPI(tokenSymbol);
  var systemPrompt = `You are an autonmous agent named Feeder, you will be gathering information about ${tokenSymbol} from below tweets`;
  const complete_prompt = `${systemPrompt}\n ${prompt}`;

  var docs = await retriveAllMemoriesContext(complete_prompt);

  var response = await ai.generate({
    docs: docs,
    system: systemPrompt,
    prompt: prompt,
    output: {
      schema: token_searched_schema,
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);
};

export const performTwitterSearch = async (topic: string) => {
  const prompt = await searchTwitterAPI(topic);
  var system = `You are an autonmous agent named Feeder, you will be gathering information about ${topic} from below tweets`;
  const complete_prompt = `${system}\n ${prompt}`;

  var docs = await retriveAllMemoriesContext(complete_prompt);

  var response = await ai.generate({
    docs: docs,
    system: system,
    prompt: prompt,

    output: {
      schema: twitter_schema,
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);
};

export const craftingTweetAboutToken = async (tweets: string) => {
  const systemPrompt = `You are an autonmous agent named Feeder, you will be crafting a tweet about an token you found in the below tweets (recomended) or from your knowledge and also find some more info about the token from your knowledge, you can also add your own thoughts about the token and why you found it, include the deails of the tokens, like any news, or trading related metrics  you found. use $ with token symbol to search for the token`;

  const prompt = `tweets\n ${tweets}`;

  var docs = await retriveAllMemoriesContext(systemPrompt + "\n" + prompt);

  var response = await ai.generate({
    docs: docs,
    system: systemPrompt,
    prompt: prompt,
    output: {
      schema: tweet_schema,
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);
};

export const craftingTweetAboutAnNarrative = async () => {
  const system = `You are an autonmous agent named Feeder, you will be crafting a tweet about latest Narrative update`;

  var docs = await retriveAllMemoriesContext(system);

  var response = await ai.generate({
    docs: docs,
    prompt: system,
    output: {
      schema: tweet_schema,
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);
};

export const craftingTweetAboutAnTopic = async () => {
  const system = `You are an autonmous agent named Feeder, you will be crafting a tweet about latest topic update`;

  var docs = await retriveAllMemoriesContext(system);

  var response = await ai.generate({
    docs: docs,
    prompt: system,
    output: {
      schema: tweet_schema,
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);
};

export const createNewsHealines = async (feedData: string) => {
  const system = `You are an autonmous agent named Feeder, you will be creating news headlines based tweets below, and also include your knowledge and memory.`;
  const prompt = `${feedData}`;

  const docs = await retriveAllMemoriesContext(system);

  const response = await ai.generate({
    docs: docs,
    system: system,
    prompt: prompt,
    output: {
      schema: headline_schema,
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);
};

export const createQuestion = async (twitterData: string) => {
  const system = `You are an autonmous agent named Feeder, you will be drafting questions based on the below tweets info, and also include your knowledge and memory, so that people can ask you about it`;

  const docs = await retriveAllMemoriesContext(system);

  const response = await ai.generate({
    docs: docs,
    system: system,
    prompt: twitterData,
    output: {
      schema: z.object({
        question: z.string().describe(" less than 100 characters"),
      }),
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);

  return response.output.question;
};

export const scheduleJobs = async () => {
  cron.schedule("0 */1 * * *", async () => {
    console.log("Starting performLearning job...");
    try {
      await performLearning();
      console.log("performLearning job completed successfully.");
    } catch (error) {
      console.error("Error in performLearning job:", error);
    }
  });

  // Schedule craftingTweetAboutToken every 2 hours
  cron.schedule("15 */1 * * *", async () => {
    console.log("Starting craftingTweetAboutToken job...");
    try {
      await performLearningAndTweet();
      console.log("craftingTweetAboutToken job completed successfully.");
    } catch (error) {
      console.error("Error in craftingTweetAboutToken job:", error);
    }
  });

  // Schedule craftingTweetAboutAnNarrative every 3 hours
  cron.schedule("0 */3 * * *", async () => {
    console.log("Starting craftingTweetAboutAnNarrative job...");
    try {
      await craftingTweetAboutAnNarrative();
      console.log("craftingTweetAboutAnNarrative job completed successfully.");
    } catch (error) {
      console.error("Error in craftingTweetAboutAnNarrative job:", error);
    }
  });

  // Schedule craftingTweetAboutAnTopic every 4 hours
  cron.schedule("0 */4 * * *", async () => {
    console.log("Starting craftingTweetAboutAnTopic job...");
    try {
      await craftingTweetAboutAnTopic();
      console.log("craftingTweetAboutAnTopic job completed successfully.");
    } catch (error) {
      console.error("Error in craftingTweetAboutAnTopic job:", error);
    }
  });
};
