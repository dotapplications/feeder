import { ai } from "../genkit_init";
import cron from "node-cron";
import {
  checkIsLoggedIn,
  loginTwitter,
  readTwitterHomeTimeline,
  searchAboutaTokenAPI,
  searchGrokAboutToken,
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

  // Helper function to add delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  var tokenArray = await getTokenArray();

  response.output.tokens_to_track.forEach((token) => {
    if (!tokenArray.tokensToTweet.includes(token.token_symbol.toLowerCase())) {
      tokenArray.tokensToTweet.push(token.token_symbol.toLowerCase());
    }
  });

  await setTokenArray(tokenArray);

  // await createQuestion(twitterFeedData);
  // await delay(60000); // 1 minute delay

  // await createNewsHealines(twitterFeedData);
  // await delay(60000); // 1 minute delay

  await craftingTweetAboutToken(twitterFeedData);
  await delay(60000); // 1 minute delay

  // Process tokens with a delay

  // // Process tokens with a delay
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

export const craftTweetUsingGrok = async (tokenSymbol: string) => {
  // const details = searchGrokAboutToken(tokenSymbol);

  const systemPrompt = `formate below, don't use hashtags hashtags, include emojis and stickers, Consider your personaliy`;
  var docs = await retrivePersonalityMemory(systemPrompt);

  var prompt = `
  Here's a detailed tweet about the $SNEK Token, including all the recent information available:

$SNEK Token Overview 📊📷

$SNEK is more than just a memecoin; it's a cultural phenomenon on the Cardano blockchain, designed to unite communities and push the boundaries of what memecoins can achieve. Here are the latest details:

📷Tokenomics:
Total Supply: 76,715,880,000 SNEK
Circulating Supply: Approximately 74.36 Billion SNEK
Current Price: $0.006463 USD (as of recent update)
Market Cap: $480,830,356 USD
24h Trading Volume: $3,261,757 USD (last known)

📷 Distribution:
50% to presale participants
40% for initial liquidity on Minswap
5% for partnerships and project development
3% for crypto exchange listings
2% for community airdrops
No tokens were allocated to the team, emphasizing a community-driven approach.

📷 Recent Developments:
Trading Volume: SNEK has been one of the most traded tokens on Cardano, with significant activity on Minswap, where SNEK/ADA pair holds substantial liquidity.
Price Movement: It experienced a 7.10% increase in the last 7 days, underperforming the general crypto market and similar meme tokens but still showing growth.
Burn Mechanism: SNEK implements a deflationary model with 80% of various revenue streams dedicated to burning tokens, reducing total supply over time.

📷 Exchanges:
Available on centralized exchanges like Gate.io, Bitget, MEXC, and decentralized platforms like Minswap and SundaeSwap.

📷 Community and Utility:
Strong community engagement with initiatives like Snekboard.com tracking buys and providing holder leaderboards.
SNEK has ventured into the physical world with SNEK ENERGY drinks, enhancing brand visibility.
Staking options through Snekies.com, where participants can stake NFTs to earn $SNEK rewards.

📷 Cultural Impact:
Known for its light-hearted, community-centric approach, SNEK has become a symbol of fun and innovation in the Cardano ecosystem, aiming to bridge web3 onboarding.

📷 Future Plans:
Continued focus on community-led projects via the Snek Ecosystem Fund.
Expansion into new markets for SNEK ENERGY, alongside ongoing token burns to manage supply.

📷 Latest News:
SNEK has been in the news for its high trading volumes, community events, and the introduction of new staking mechanisms.

For those interested in diving deeper, check out:
CoinGecko for live price charts and market data.📷

CoinMarketCap for comprehensive market cap and trading volume insights.📷

Snek's official site for more on the community and project vision.📷


#SNEK #Cardano #MemeCoin #Crypto #Staking #SNEKENERGY

Note: This tweet would be too long for actual Twitter post limits, so in reality, you would need to split this information into multiple tweets or use a thread format to convey all this information.
  `;

  // const prompt = `tweets\n ${tweets}`;

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
          .describe("Include imoji and stickers, don't include hashtags"),
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
  cron.schedule("0 */1 * * *", async () => {
    console.log("Starting craftingTweetAboutToken job...");
    try {
      await performLearningAndTweet();
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

  //schedular for every 30 mins that will tweet about token
  cron.schedule("0 */30 * * *", async () => {
    console.log("Starting craftingTweetAboutToken job...");
    try {
      var tokenArray = await getTokenArray();
      const contextToken = tokenArray.tokensToTweet[0];
      if (contextToken) {
        // remove tweeted token from tokensToTweet and add to tweetedTokens if it does not exist (make everything lowercase)

        await craftingTweetAboutToken(contextToken);
        if (tokenArray.tokensToTweet.includes(contextToken.toLowerCase())) {
          tokenArray.tokensToTweet = tokenArray.tokensToTweet.filter(
            (token: string) => token !== contextToken.toLowerCase()
          );
          tokenArray.tweetedTokens.push(contextToken.toLowerCase());
        }
        await setTokenArray(tokenArray);
        console.log("craftingTweetAboutToken job completed successfully.");
      }
    } catch (error) {
      console.error("Error in craftingTweetAboutToken job:", error);
    }
  });
};
