import { ai } from "../genkit_init";
import cron from "node-cron";
import {
  checkIsLoggedIn,
  createTweetAPI,
  generateReplyToTweetGrok,
  grokCreateTweetSummary,
  loginTwitter,
  readTwitterHomeTimeline,
  replyToTweetAPI,
  searchAboutaTokenAPI,
  searchGrokAboutToken,
  searchTwitterAPI,
  tweetAboutPopularToken,
  tweetAboutTokenGrok,
} from "../api/user_api/twitter-eliza";
import {
  getPersonalityMemory,
  retriveAllMemoriesContext,
} from "../api/settings_api/memory_invocation_tools";
import {
  long_tweet_schema,
  token_searched_schema,
  tweet_schema,
  twitter_schema,
} from "../schemas/twitter_schema";
import { handleAgentResponse } from "./response_modules";
import { GenerateResponse, z } from "genkit";
import { headline_schema } from "../schemas/headline_schema";
import { retriveEntityMemory } from "../memory/entity_memory";
import {
  retrivePersonalityMemory,
  shanks_personality,
} from "../memory/peronality_memory";
import { retriveExperienceMemory } from "../memory/experience_memory";
import { getTokenArray, setTokenArray } from "../api/user_api/tweet_tokens";

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

export const createReflectionsAPI = async () => {
  const system = `Need to know what are the new informations about token $LLM`;
  const reflectionsMemory = await retriveExperienceMemory(system);

  console.log(
    "Reflections memory",
    reflectionsMemory.map((item) => item.text)
  );

  const prompt = `Observations and activity summaries context: ${JSON.stringify(
    reflectionsMemory
  )}`;

  // const response = await ai.generate({
  //   system: system,
  //   prompt: prompt,
  //   output: {
  //     schema: z.object({
  //       reflections: z.string().describe(""),
  //     }),
  //   },
  // });

  // console.log("Response from agent", response.output);
  // await handleAgentResponse(response);
};

export const performLearningAndTweet = async () => {
  await loginTwitter();
  const twitterFeedData = await readTwitterHomeTimeline();
  const systemPrompt =
    "you will be reading twitter feeds below and generate output based on the most important and relvent information you have read";
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

  console.log("Response from agent", response.output.observation);

  // Helper function to add delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // var tokenArray = await getTokenArray();

  // response.output.tokens_to_track.forEach((token) => {
  //   //if token symbol has $ symbol remove it
  //   token.token_symbol = token.token_symbol.replace("$", "");
  //   if (!tokenArray.tokensToTweet.includes(token.token_symbol.toLowerCase())) {
  //     tokenArray.tokensToTweet.push(token.token_symbol.toLowerCase());
  //   }
  // });

  // await setTokenArray(tokenArray);

  // await createQuestion(twitterFeedData);
  // await delay(60000); // 1 minute delay

  // await createNewsHealines(twitterFeedData);
  // await delay(60000); // 1 minute delay

  // console.log("Response from agent", response.output.tweet_to_reply);

  await craftDetailedTweet(twitterFeedData);
  await delay(300000);
  // 1 minute delay

  for (const tweet of response.output.tweets_to_reply) {
    await replyToTweet(tweet.tweet_id, tweet.tweet);
    await delay(300000); // Wait for 60 seconds before processing the next tweet
  }

  // Process tokens with a delay

  // Process tokens with a delay
  // for (const token of response.output.tokens_to_track) {
  //   await performLearningAboutToken(token.token_symbol);
  //   await delay(60000); // 1 minute delay
  // }

  // // Process topics with a delay
  // for (const topic of response.output.topics_to_track) {
  //   await performTwitterSearch(topic.topic);
  //   await delay(60000); // 1 minute delay
  // }

  // // Process narratives with a delay
  // for (const narrative of response.output.narratives_to_track) {
  //   await performTwitterSearch(narrative.narrative);
  //   await delay(60000); // 1 minute delay
  // }
};

export const performLearningAndTweetAboutToken = async () => {
  await loginTwitter();
  const twitterFeedData = await readTwitterHomeTimeline();
  // const systemPrompt =
  //   "you will be reading twitter feeds below and generate output based on the most important and relvent information you have read";
  // const prompt = `${twitterFeedData}`;
  // const complete_prompt = `${systemPrompt}\n ${twitterFeedData}`;
  // var docs = await retriveAllMemoriesContext(complete_prompt);

  // var response = await ai.generate({
  //   docs: docs,
  //   system: systemPrompt,
  //   prompt: prompt,
  //   output: {
  //     schema: twitter_schema,
  //   },
  // });

  // console.log("Response from agent", response.output.observation);

  // Helper function to add delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // var tokenArray = await getTokenArray();

  // response.output.tokens_to_track.forEach((token) => {
  //   //if token symbol has $ symbol remove it
  //   token.token_symbol = token.token_symbol.replace("$", "");
  //   if (!tokenArray.tokensToTweet.includes(token.token_symbol.toLowerCase())) {
  //     tokenArray.tokensToTweet.push(token.token_symbol.toLowerCase());
  //   }
  // });

  // await setTokenArray(tokenArray);

  // await createQuestion(twitterFeedData);
  // await delay(60000); // 1 minute delay

  // await createNewsHealines(twitterFeedData);
  // await delay(60000); // 1 minute delay

  // console.log("Response from agent", response.output.tweet_to_reply);
  // await delay(60000);

  await craftDetailedTweetAboutToken(twitterFeedData);
  // 1 minute delay

  // Process tokens with a delay

  // Process tokens with a delay
  // for (const token of response.output.tokens_to_track) {
  //   await performLearningAboutToken(token.token_symbol);
  //   await delay(60000); // 1 minute delay
  // }

  // // Process topics with a delay
  // for (const topic of response.output.topics_to_track) {
  //   await performTwitterSearch(topic.topic);
  //   await delay(60000); // 1 minute delay
  // }

  // // Process narratives with a delay
  // for (const narrative of response.output.narratives_to_track) {
  //   await performTwitterSearch(narrative.narrative);
  //   await delay(60000); // 1 minute delay
  // }
};

export const performLearningReply = async () => {
  await loginTwitter();
  const twitterFeedData = await readTwitterHomeTimeline();
  const systemPrompt =
    "you will be reading twitter feeds below and generate output based on the information you have read";
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

  console.log("Response from agent", response.output);

  // Helper function to add delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // var tokenArray = await getTokenArray();

  // response.output.tokens_to_track.forEach((token) => {
  //   //if token symbol has $ symbol remove it
  //   token.token_symbol = token.token_symbol.replace("$", "");
  //   if (!tokenArray.tokensToTweet.includes(token.token_symbol.toLowerCase())) {
  //     tokenArray.tokensToTweet.push(token.token_symbol.toLowerCase());
  //   }
  // });

  // await setTokenArray(tokenArray);

  // await createQuestion(twitterFeedData);
  // await delay(60000); // 1 minute delay

  // await createNewsHealines(twitterFeedData);
  // await delay(60000); // 1 minute delay

  // console.log("Response from agent", response.output.tweet_to_reply);

  // 1 minute delay

  for (const tweet of response.output.tweets_to_reply) {
    await replyToTweet(tweet.tweet_id, tweet.tweet);
    await delay(300000); // Wait for 60 seconds before processing the next tweet
  }

  // Process tokens with a delay

  // Process tokens with a delay
  // for (const token of response.output.tokens_to_track) {
  //   await performLearningAboutToken(token.token_symbol);
  //   await delay(60000); // 1 minute delay
  // }

  // // Process topics with a delay
  // for (const topic of response.output.topics_to_track) {
  //   await performTwitterSearch(topic.topic);
  //   await delay(60000); // 1 minute delay
  // }

  // // Process narratives with a delay
  // for (const narrative of response.output.narratives_to_track) {
  //   await performTwitterSearch(narrative.narrative);
  //   await delay(60000); // 1 minute delay
  // }
};

export const giveReplyToTweet = async () => {
  var systemPrompt = `feeder crafted an tweet: Spotted $LLM generating buzz! 🚀 Some see moon potential, others caution.  It's showing up alongside major players like $BTC and $ETH.  DYOR before investing!, and got an reply: if only every buzz was a guarantee! what’s next, time travel investments?, need to give an reply `;

  const entityDoc = await retriveEntityMemory(systemPrompt);

  const personalityDoc = await getPersonalityMemory(systemPrompt);

  var response = await ai.generate({
    system: systemPrompt,
    prompt: `Use the following knowledge context to reply context:${JSON.stringify(
      entityDoc
    )} and use use personality context: ${JSON.stringify(personalityDoc)}`,
    output: {
      schema: z.object({
        reply: z.string().describe("less than 280 characters"),
      }),
    },
  });

  console.log("Response from agent", response.output);
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

export const craftDetailedTweet = async (tweets: string) => {
  const grokResponse = await grokCreateTweetSummary(tweets);

  // console.log(grokResponse);
  // const personalityMemoryDoc = await retrivePersonalityMemory(
  //   "You are creating an tweet about your prediction and observervation"
  // );
  // console.log(personalityMemoryDoc.map((e) => console.log(e.content)));
  const systemPrompt = `You will be creating tweet regarding the predictions with relevent data or observation to back the prediction, tweet should be well formated,  don't use hashtags, bold text, may include emojis and stickers`;

  const prompt = `${grokResponse} \n consider below personality while tweeting ${shanks_personality}`;

  // var docs = await retriveAllMemoriesContext(systemPrompt + "\n" + prompt);

  var response = await ai.generate({
    // docs: docs,
    system: systemPrompt,
    prompt: prompt,
    output: {
      schema: long_tweet_schema,
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);
};

export const craftDetailedTweetAboutToken = async (tweets: string) => {
  const grokResponse = await tweetAboutTokenGrok(tweets);

  // console.log(grokResponse);
  // const personalityMemoryDoc = await retrivePersonalityMemory(
  //   "You are creating an tweet about your prediction and observervation"
  // );
  // console.log(personalityMemoryDoc.map((e) => console.log(e.content)));
  const systemPrompt = `You will be creating tweet regarding the predictions with relevent data or observation to back the prediction, tweet should be well formated,  don't use hashtags, bold text, may include emojis and stickers`;

  const prompt = `${grokResponse} \n consider below personality while tweeting ${shanks_personality}`;

  // var docs = await retriveAllMemoriesContext(systemPrompt + "\n" + prompt);

  var response = await ai.generate({
    // docs: docs,
    system: systemPrompt,
    prompt: prompt,
    output: {
      schema: long_tweet_schema,
    },
  });

  console.log("Response from agent", response.output);
  await handleAgentResponse(response);
};

export const craftTweetUsingGrok = async (tokenSymbol: string) => {
  const details = await searchGrokAboutToken(tokenSymbol);
  console.log("Details", details);

  const systemPrompt = `formate below content, don't use hashtags, bold text, include emojis and stickers, and it should be well formated (consider spacing content with line breaks for readability) Consider your personaliy`;
  var docs = await retrivePersonalityMemory(systemPrompt);

  var prompt = details;

  console.log(
    "Reflections memory",
    docs.map((item) => item.text)
  );
  var response = await ai.generate({
    system: systemPrompt,
    prompt: prompt,
    docs,
    output: {
      schema: z.object({
        tweet_thread: z
          .string()
          .describe(
            " don't include hashtags, don't use bold text, include emojis and stickers"
          ),
      }),
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

export const replyToTweet = async (tweetId: string, tweet: string) => {
  const grokResponse = await generateReplyToTweetGrok(tweet);

  console.log(grokResponse);
  const system = `create an short reply for the tweet:${tweet}, using the predictions and observations below `;
  const prompt = `${grokResponse} \n for replying consider the personality ${shanks_personality}`;

  // const docs = await retriveAllMemoriesContext(system + "\n" + prompt);

  const response = await ai.generate({
    system: system,
    prompt: prompt,
    // docs: docs,
    output: {
      schema: z.object({
        reply: z
          .string()
          .describe("less than 280 characters, don't use hashtags"),
        activity_summary: z.string().describe("summary of the activity"),
      }),
    },
  });

  // console.log("Response from agent", response.output);
  console.log("tweet id" + tweetId);
  console.log("reply " + tweetId);
  replyToTweetAPI(tweetId, response.output.reply);
  await handleAgentResponse(response);
};

export const scheduleJobs = async () => {
  // cron.schedule("0 */1 * * *", async () => {
  //   console.log("Starting performLearning job...");
  //   try {
  //     await performLearning();
  //     console.log("performLearning job completed successfully.");
  //   } catch (error) {
  //     console.error("Error in performLearning job:", error);
  //   }
  // });

  // Schedule craftingTweetAboutToken every 2 hours
  cron.schedule("*/40 * * * *", async () => {
    console.log("Starting craftingTweetAboutToken job...");
    try {
      await performLearningAndTweet();
      console.log("craftingTweetAboutToken job completed successfully.");
    } catch (error) {
      console.error("Error in craftingTweetAboutToken job:", error);
    }
  });

  cron.schedule("*/30 * * * *", async () => {
    console.log("Starting craftingTweetAboutToken job...");
    try {
      await performLearningAndTweetAboutToken();
      console.log("craftingTweetAboutToken job completed successfully.");
    } catch (error) {
      console.error("Error in craftingTweetAboutToken job:", error);
    }
  });

  // Schedule craftingTweetAboutAnNarrative every 3 hours
  // cron.schedule("0 */3 * * *", async () => {
  //   console.log("Starting craftingTweetAboutAnNarrative job...");
  //   try {
  //     await craftingTweetAboutAnNarrative();
  //     console.log("craftingTweetAboutAnNarrative job completed successfully.");
  //   } catch (error) {
  //     console.error("Error in craftingTweetAboutAnNarrative job:", error);
  //   }
  // });

  // Schedule craftingTweetAboutAnTopic every 4 hours
  // cron.schedule("0 */4 * * *", async () => {
  //   console.log("Starting craftingTweetAboutAnTopic job...");
  //   try {
  //     await craftingTweetAboutAnTopic();
  //     console.log("craftingTweetAboutAnTopic job completed successfully.");
  //   } catch (error) {
  //     console.error("Error in craftingTweetAboutAnTopic job:", error);
  //   }
  // });

  // cron.schedule("*/35 * * * *", async () => {
  //   await findWhatMostPeopleTalking();
  // });

  cron.schedule("*/25 * * * *", async () => {
    await performLearningReply();
  });
  //schedular for every 30 mins that will tweet about token
  // cron.schedule("*/45 * * * *", async () => {
  //   console.log("Starting craftingTweetAboutToken job...");
  //   try {
  //     var tokenArray = await getTokenArray();
  //     //find a token from tokenArray.tokensToTweet that is not in tokenArray.tweetedTokens
  //     const contextToken = tokenArray.tokensToTweet.find(
  //       (token: string) =>
  //         !tokenArray.tweetedTokens.includes(token.toLowerCase())
  //     );
  //     // const contextToken =
  //     //   tokenArray.tokensToTweet[tokenArray.tokensToTweet.length - 1];
  //     if (contextToken) {
  //       // remove tweeted token from tokensToTweet and add to tweetedTokens if it does not exist (make everything lowercase)

  //       await craftTweetUsingGrok(contextToken);
  //       if (tokenArray.tokensToTweet.includes(contextToken.toLowerCase())) {
  //         tokenArray.tokensToTweet = tokenArray.tokensToTweet.filter(
  //           (token: string) => token !== contextToken.toLowerCase()
  //         );
  //         tokenArray.tweetedTokens.push(contextToken.toLowerCase());
  //       }
  //       await setTokenArray(tokenArray);
  //       console.log("craftingTweetAboutToken job completed successfully.");
  //     }
  //   } catch (error) {
  //     console.error("Error in craftingTweetAboutToken job:", error);
  //   }
  // });
};

function removeOnlyQuotes(str: string): string {
  if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
    return str.slice(1, -1);
  }
  return str;
}

export const findWhatMostPeopleTalking = async () => {
  const details = await tweetAboutPopularToken();

  console.log(details);
  const tweet = removeOnlyQuotes(details);

  // check fist letter and last letter is ", then remove both " from first and last

  // var response = await ai.generate({
  //   system: "create tweet",
  //   prompt: prompt,
  //   output: {
  //     schema: z.object({
  //       tweet: z
  //         .string()
  //         .describe(
  //           " don't include hashtags, don't use bold text, include emojis and stickers"
  //         ),
  //     }),
  //   },
  // });

  // console.log(response);

  await createTweetAPI(tweet);
};
