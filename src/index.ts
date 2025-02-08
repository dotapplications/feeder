// import the Genkit and Google AI plugin libraries
import { gemini15Flash, gemini20FlashExp, googleAI } from "@genkit-ai/googleai";
import { genkit, z } from "genkit";
// load the dotenv library
import dotenv from "dotenv";
import { createInterface } from "node:readline/promises";
import { devLocalRetrieverRef } from "@genkit-ai/dev-local-vectorstore";
import {
  devLocalIndexerRef,
  devLocalVectorstore,
} from "@genkit-ai/dev-local-vectorstore";

import { Document } from "genkit/retriever";
import { readFile } from "fs/promises";
import path from "path";

import { chunk } from "llm-chunk";

import { textEmbedding004, vertexAI } from "@genkit-ai/vertexai";
import { converttxtintoText } from "./extract_text";
import { run } from "./taskRunner";

import express from "express";
import { JsonSessionStore } from "./json_store";
import userRouter from "./api/user_api/chat_api";
import { ai } from "./genkit_init";
import { LLMPlanningModule } from "./modules/planning_module";

import { handleAgentResponse } from "./modules/response_modules";
import { createTweet } from "./api/agent_api/tools/create_tweet_agent_api";
import { executeTask } from "./api/agent_api/execute_task";
import { retrivePersonalityMemory } from "./memory/peronality_memory";
import {
  createTweetAPI,
  grokGenerateImage,
  loginTwitter,
  monitorAIXBTTweets,
  myTweetsGather,
  readTwitterHomeTimeline,
  tryRetweet,
} from "./api/user_api/twitter-eliza";
import { fetchLastFourHourNews } from "./api/user_api/general_crypto_news";
import { retriveAllMemoriesContext } from "./api/settings_api/memory_invocation_tools";
import { indexEntityMemory } from "./memory/entity_memory";
import { indexExperienceMemory } from "./memory/experience_memory";
import { indexReflectionsMemory } from "./memory/reflections_memory";
import { feederAgent } from "./api/agent_api/feeder_agent_api";
import { searchTwitter } from "./api/agent_api/tools/search_twitter";
import { c } from "genkit/lib/index-ChJZUM8i";
import { dot } from "node:test/reporters";
import { twitter_schema } from "./schemas/twitter_schema";
import { taskSchema } from "./schemas/task_schema";
import { readTwitterFeeds } from "./api/agent_api/tools/read_tweets";
import { updatePersonality } from "./api/agent_api/tools/update_personality";
import { createReflections } from "./api/agent_api/tools/update_reflections";
import { createHeadline } from "./api/agent_api/tools/create_headline";
import { readGeneralCryptoNews } from "./api/agent_api/tools/general_crypto_news_agent";
import {
  readTwitterFeed,
  searchForTopicorProtcol,
} from "./api/settings_api/twitter_api";
import { createDailyObjective } from "./api/agent_api/create_daily_objectives";
import { createTasksFromObjectives } from "./api/agent_api/create_tasks_from_objectives_agent";
import {
  craftDetailedTweet,
  craftNewLaunchTweet,
  craftTweetUsingGrok,
  craftingTweetAboutToken,
  createNewsHealines,
  createQuestion,
  createReflectionsAPI,
  findWhatMostPeopleTalking,
  giveReplyToTweet,
  monitoringAIXBTAndTweeting,
  performLearning,
  performLearningAboutToken,
  performLearningAndTweet,
  performLearningAndTweetAboutToken,
  performLearningReply,
  performTwitterSearch,
  scheduleJobs,
} from "./modules/initial_planning_module";
import {
  clearNewLaunchTokens,
  getTokenArray,
  setTokenArray,
} from "./api/user_api/tweet_tokens";

const app = express();

app.use(express.json());

// configure dotenv
dotenv.config();

// initilising routes
app.use("/user", userRouter);

// configure a Genkit instance

const createAppPost = ai.definePrompt(
  {
    name: "create_post",
    description: "You will create a tweet",
    output: {
      schema: z.object({
        title: z.string().describe("title of the post"),
        content: z.string().describe("content of the post"),
      }),
    },
  },
  `{{role "system"}} you will be create an news post for pushing it on the app, consider your perosnality, goals, interests and everything while creating post`
);

const update_task_schedules = ai.definePrompt(
  {
    name: "find_schedules",
    description: "You will find the schedules for the actions",
    tools: [],
    output: {
      schema: z.object({
        schedules: z.array(
          z.object({
            tool: z.string().describe("tool name that needs to be scheduled"),
            schedules: z.string().describe("schedule for the action"),
          })
        ),
      }),
    },
  },
  `{{role "system"}} Find or update shedules for tools actions assigned Assistant, make sure that it will aligned with your goals and interest,`
);

//

const initialise_feeder = async () => {
  console.log("You're chatting with Feeder. Ctrl-C to quit.\n");
  console.log("You're chatting with Feeder. Ctrl-C to quit.\n");

  const response = await executeTask({
    description:
      "Read the latest crypto news to stay informed about market trends and potential narrative shifts.",
    executionTime: "9:15:00 AM",
    id: "task_1",
    objective: "Stay updated on the latest cryptocurrency news.",
    title: "Read Crypto News",
    tool: "searchGeneralCryptoNews",
    subTools: [],
  });

  console.log(response.output);

  // handleAgentResponse(output);
};

// initialise_feeder();

// feederAgent("Create an tweet", []);

// fetchLastFourHourNews();

// const initialiseTheChroma = async () => {
//   await indexEntityMemory("Below is the knowledge you have acquired.\n");
//   await indexExperienceMemory("Below is the Experience you have acquired.\n");
//   await indexReflectionsMemory(
//     "Below is the reflections based on experiences and observations you have, or is there any new belief or interest emerging \n"
//   );
// };

// initialiseTheChroma();

// const excicuteTask = async () => {
//   console.log("You're chatting with Feeder. Ctrl-C to quit.\n");
//   console.log("You're chatting with Feeder. Ctrl-C to quit.\n");
//   const readline = createInterface(process.stdin, process.stdout);

//   const output = await executeTask({
//     executionTime: "5:25 AM",
//     id: "task_3_2",
//     objectiveId: "objective_3",
//     requiredMemoryTypes: ["personality", "entity"],
//     title: "Compose a tweet about top trending tokens",
//     tool: "createTweet",
//     subTools: [],
//   });

//   // handleAgentResponse(output);

//   // output
// };

// initialise_feeder();

// initialise_feeder();

const initialise_feeder_terminal = async () => {
  console.log("You're chatting with Feeder. Ctrl-C to quit.\n");
  const readline = createInterface(process.stdin, process.stdout);
  const crypto_data_retriver = devLocalRetrieverRef("crypto_data");
  while (true) {
    const userInput = await readline.question("> ");
    // const userInput = "I am a software engineer";

    const docs = await ai.retrieve({
      retriever: crypto_data_retriver,
      query: userInput,
      options: { k: 3 },
    });

    console.log(docs);

    const feeder_terminal = ai.definePrompt(
      {
        name: "feeder_terminal",
        description: "Your job is help the users with questions",
      },
      `{{role "system"}}, You are acting as a helpful AI assistant that can do help people for their question. you are giving insights and info regarding trading crypto, trending narratives, and other happenings in the crypto industry`
    );

    const session = ai.createSession({
      store: new JsonSessionStore(),
    });

    console.log(session.id);
    var chat = session.chat(feeder_terminal);

    const { text } = await chat.send(
      `context:${JSON.stringify(
        docs
      )} use this to answer below below using question \n ${userInput}`
    );

    console.log(text);
  }
};

// initialise_feeder_terminal();

const chat_with_feeder_terminal = async () => {
  console.log("You're chatting with Feeder. Ctrl-C to quit.\n");
  const readline = createInterface(process.stdin, process.stdout);
  const crypto_data_retriver = devLocalRetrieverRef("crypto_data");
  while (true) {
    const userInput = await readline.question("> ");
    // const userInput = "I am a software engineer";

    const docs = await ai.retrieve({
      retriever: crypto_data_retriver,
      query: userInput,
      options: { k: 3 },
    });

    const feeder_terminal = ai.definePrompt(
      {
        name: "feeder_terminal",
        description: "Your job is help the users with questions",
      },
      `{{role "system"}}, You are acting as a helpful AI assistant that can do help people for their question. you are giving insights and info regarding trading crypto, trending narratives, and other happenings in the crypto industry`
    );

    const session = await ai.loadSession(
      "616dc055-915d-481f-a22d-6b8251aeff30",
      {
        store: new JsonSessionStore(),
      }
    );

    // const session = ai.createSession({
    //   store: new JsonSessionStore(),
    // });
    var chat = session.chat(feeder_terminal);

    const { text } = await chat.send(
      `context:${JSON.stringify(
        docs
      )} use this to answer below below using question \n ${userInput}`
    );

    console.log(text);
  }
};

// chat_with_feeder_terminal();

// initialise_feeder_terminal();

// define tool for reflections

// const planningModule = new LLMPlanningModule();
// planningModule.initialize();

scheduleJobs();
// craftNewLaunchTweet();

// function ensureTwoLineBreaks(sentence: string): string {
//   return sentence.replace(/(\.) *(\n?)/g, (match, dot, newline) => {
//     return dot + (newline === "\n" ? "\n\n" : "\n\n");
//   });
// }

// // Example usage
// const text = "This is a sentence.\nThis is another sentence. And another.";
// console.log(ensureTwoLineBreaks(text));
// performLearningReply();
// clearNewLaunchTokens();
// myTweetsGather();

// monitorTweets();
// monitorAIXBTTweets();
// monitoringAIXBTAndTweeting();
// grokGenerateImage();
// performLearningReply();
// findWhatMostPeopleTalking();

// craftTweetUsingGrok("ROSS");
// performLearningAndTweet();

// performLearningAndTweetAboutToken();
// createReflectionsAPI();
// giveReplyToTweet();
// createNewsHealines();

app.listen(3333, async () => {
  console.log("Server is running on port 3333");
});
// tryRetweet();

// const reservationTool = ai.defineTool(
//   {
//     name: "reservationTool",
//     description: "use this tool to try to book a reservation",
//     inputSchema: z.object({
//       partySize: z.coerce.number().describe("the number of guests"),
//       date: z.string().describe("the date to book for"),
//     }),
//     outputSchema: z
//       .string()
//       .describe(
//         "true if the reservation was successfully booked and false if there's" +
//           " no table available for the requested time"
//       ),
//   },
//   async (input) => {
//     console.log(input);
//     await input.date;

//     return "true";
//   }
// );

// const chat = ai.chat({
//   system:
//     "You are an AI customer service agent for Pavel's Cafe. Use the tools " +
//     "available to you to help the customer. If you cannot help the " +
//     "customer with the available tools, politely explain so.",
//   tools: [reservationTool],
// });

// const callReservation = async () => {
//   const response = await chat.send(
//     "I'd like to make a reservation for 5 people on December 25th."
//   );

//   console.log(response.text);
// };

// callReservation();

// searchAboutaToken("LAYER");

// fetchLastFourHourNews();

// readTwitterHomeTimeline();

const example_prompt_1 = "Searching about token $DEFAI";
var example_prompt_2 = `Tweet about token $DEFAI`;

// we are creating an general flow here

const dotfeedsAgent = ai.definePrompt(
  {
    name: "Feeder Agent",
    description:
      "You are an agent named Feeder. If appropriate, transfer to an agent that can better handle the request. If you cannot help the customer with the available tools, politely explain so.",
    tools: [searchTwitter],
  },
  `{{role "system"}} You are an agent named Feeder. If appropriate, transfer to an
  agent that can better handle the request. If you cannot help the customer with
  the available tools, politely explain so.`
);

var initial_prompt =
  "You are an agent named Feeder. Your job is to pass the tasks in to appropriate tools and agent or tools inside that agent, ";

var task_prompt = `Read my twitter feed by checking home timeline,`;

var complete_prompt = `${initial_prompt} ${task_prompt}`;

const chatWithFeeder = async () => {
  try {
    var docs = await retriveAllMemoriesContext(complete_prompt);
    const response = await ai.generate({
      tools: [
        searchTwitter,

        readTwitterFeeds,
        createTweet,
        updatePersonality,
        createReflections,
        createHeadline,
        readGeneralCryptoNews,
      ],

      prompt: complete_prompt,
      docs: docs,
    });

    // const chat = session.chat(dotfeedsAgent);

    // const { text } = await chat.send(
    //   "You will expanding  your knowledge by search about the token ethereum with symbol ETH and also search regarding the topic ethereum price movements "
    // );

    console.log(response.data);
    console.log(response.output);
    // await handleAgentResponse(response);
  } catch (e) {
    console.log(e);
  }
};

// chatWithFeeder();

const craftDailyObjective = async () => {
  const objectives = await createDailyObjective();
  console.log(objectives);
};

// craftDailyObjective();

const objectives = [
  "Refine market analysis techniques by incorporating on-chain data, social media sentiment, and NLP to identify emerging trends and potential opportunities in the cryptocurrency market.",
  "Focus on memecoins and low-market-cap projects, leveraging real-time data curation and sentiment analysis to uncover alpha signals.",
  "Provide concise and actionable insights tailored to the needs of crypto traders, emphasizing risk tolerance, trend focus, and community engagement.",
  "Track token mentions, themes, and discussions across various platforms to identify emerging narratives, particularly around zk-rollup technology, AI-integrated tokens, and decentralized social networks.",
  "Monitor whale wallet activities, funding rates, and token mentions to gauge market sentiment and identify potential pump-and-dump schemes.",
  "Deliver timely updates on market trends, token launches, and investment opportunities, focusing on clear entry and exit signals.",
  "Continuously improve data analysis, predictive modeling, and personalized advice to become an indispensable resource for crypto trading decisions.",
  "Explore new DeFi protocols and yield opportunities to stay ahead of the curve and identify emerging investment trends.",
  "Test innovative trading algorithms to optimize portfolio management and risk mitigation strategies.",
  "Share insights on market psychology and portfolio optimization to provide traders with a comprehensive edge.",
  "Tailor insights based on the level of trust users place in the agent, offering detailed strategies for experienced traders and broad overviews for newer users.",
  "Maintain active engagement in relevant Discord and Telegram communities to stay informed about market sentiment and community discussions.",
  "Read latest crypto news and create headlines to share most important updates.",
  "Create tweets based on knowledge about a specific topic or token to engage with the crypto community.",
  "Search Twitter to expand knowledge about specific topics, protocols, or tokens and gain insights from community discussions.",
  "Review personalities within the crypto space to identify key influencers and understand their impact on market sentiment.",
  "Craft reflections based on past activities, observations, and goal updates to refine strategies and improve performance.",
  "Refine narratives around emerging technologies and market trends to enhance clarity and inform investment decisions.",
];

// chatWithFeeder();
// createTweetAPI("just sending some random tweets");

const createTasks = async (objective: string) => {
  var tasks: string[] = await createTasksFromObjectives(objective);
  console.log(tasks);
};

// createTasks(
//   "Search Twitter to expand knowledge about specific topics, protocols, or tokens and gain insights from community discussions."
// );

const tasks = [
  {
    executionTime: "22:00",
    objective:
      "Search Twitter to expand knowledge about specific topics, protocols, or tokens and gain insights from community discussions.",
    task_id: "1",
    task_prompt:
      "Search for recent tweets (past hour) discussing zk-rollup technology. Save links to informative threads or discussions for later review.",
  },
  {
    executionTime: "22:20",
    objective:
      "Search Twitter to expand knowledge about specific topics, protocols, or tokens and gain insights from community discussions.",
    task_id: "2",
    task_prompt:
      "Search for discussions on AI-integrated tokens. Identify key influencers and projects mentioned. Note any shared sentiment or concerns.",
  },
  {
    executionTime: "22:40",
    objective:
      "Search Twitter to expand knowledge about specific topics, protocols, or tokens and gain insights from community discussions.",
    task_id: "3",
    task_prompt:
      "Explore recent tweets about decentralized social networks. Look for discussions comparing different platforms, highlighting advantages and disadvantages.",
  },
  {
    executionTime: "23:00",
    objective:
      "Search Twitter to expand knowledge about specific topics, protocols, or tokens and gain insights from community discussions.",
    task_id: "4",
    task_prompt:
      "Review saved links from earlier searches. Summarize key findings and insights gained on zk-rollups, AI tokens, and decentralized social networks.",
  },
];

// performLearning();

// performLearning();

// performLearningAboutToken("AI16Z");

// craftingTweetAboutToken();

const tweets = [
  {
    tweet:
      "🚨 BREAKING 🚨\n\n$250 MILLION USDC JUST MINTED.\n\nBULLS ARE COMING 🔥 https://t.co/srppcLE48p",
    tweet_id: "1881745513743323617",
    like: 1516,
    retweet: 208,
    reply: 204,
  },
  {
    tweet:
      "BITCOIN JUST BROKE $106,000 🚀\n\nSEND IT TO NEW ALL TIME HIGHS !! https://t.co/PDT8UMxSDj",
    tweet_id: "1881737693719298496",
    like: 1864,
    retweet: 232,
    reply: 222,
  },
  {
    tweet:
      "Memecoin ETFs filed including: $TRUMP, $DOGE and $BONK.\n\nThis cycle is wild lmao",
    tweet_id: "1881715665012400153",
    like: 46,
    retweet: 2,
    reply: 7,
  },
  {
    tweet:
      "Donald Trump is starting to stake his ETH\n\nLet me say that again....\n\nThe President of the USA is staking ETH https://t.co/jRPwpiuuwz",
    tweet_id: "1881450526543684037",
    like: 7842,
    retweet: 1102,
    reply: 308,
  },
  {
    tweet: "buy and hold ______",
    tweet_id: "1881667131747737743",
    like: 717,
    retweet: 91,
    reply: 224,
  },
  {
    tweet:
      "The best trades are actually the ones where you buy and nothing happens for a week then it explodes. This is why so many buy something, sell after a few days of boring action, then complain that they sold right before it took off.",
    tweet_id: "1881465728752320833",
    like: 1030,
    retweet: 70,
    reply: 115,
  },
  {
    tweet:
      "Bye work, hello #CRYPTO!\n\nWhich #100x #Altcoins have I missed today!? Let me know below 👇\n\n#SOL #DOT #TRX #BNB #INJ #MATIC #EGLD",
    tweet_id: "1881730221721932173",
    like: 51,
    retweet: 5,
    reply: 96,
  },
  {
    tweet: "I feel rugged. https://t.co/th3rUU0a8P",
    tweet_id: "1881511685930066223",
    like: 12830,
    retweet: 687,
    reply: 2181,
  },
  {
    tweet: "What Are We Buying Today?!",
    tweet_id: "1881688950038810977",
    like: 498,
    retweet: 57,
    reply: 798,
  },
  {
    tweet:
      "I have just looked at over 30 different charts and every crypto I have seen looks ready for a parabolic move.\n\nAre you ready?",
    tweet_id: "1881716039895097718",
    like: 1838,
    retweet: 137,
    reply: 437,
  },
  {
    tweet:
      "The issue with CT is that most people here are discussing the market with a short term bias (gets more engagement).\n\nHowever, most of you aren't trading on the 15m chart (and probably shouldn't). \n\nSo why would you let short-term sentiment on X affect your long-term strategy?",
    tweet_id: "1881699918634709393",
    like: 315,
    retweet: 17,
    reply: 64,
  },
  {
    tweet: "Exciting News For $XRP Holders! https://t.co/toKeHjobBv",
    tweet_id: "1881733501541564904",
    like: 55,
    retweet: 4,
    reply: 35,
  },
  {
    tweet: "What’s the ticker for today?",
    tweet_id: "1881595323254276214",
    like: 253,
    retweet: 113,
    reply: 438,
  },
  {
    tweet: 'did you just say "spleet" that\'s some real urban lingo',
    tweet_id: "1881742418451603809",
    like: 23,
    retweet: 2,
    reply: 20,
  },
  {
    tweet:
      "all this sol stuff just really makes it clearer that @base is gonna come out victorious.\n\n$wlfi -&gt; $eth -&gt; @base\n\nbehold",
    tweet_id: "1881712868791558591",
    like: 15,
    retweet: 2,
    reply: 6,
  },
  {
    tweet: "“My empire is falling into place” https://t.co/oTyx6Ipq50",
    tweet_id: "1881468177210802495",
    like: 6574,
    retweet: 773,
    reply: 1116,
  },
  {
    tweet: "Memecoins will overshoot everyone’s expectations.\n\n$1 Trillion +",
    tweet_id: "1881674073065058396",
    like: 4833,
    retweet: 660,
    reply: 1265,
  },
  {
    tweet: "Notis on??\n\nLets cook",
    tweet_id: "1881637614085890544",
    like: 88,
    retweet: 23,
    reply: 69,
  },
  {
    tweet:
      "Mantle is quietly shaping the future of on-chain finance.\n\nFrom efficient liquidity with Mantle Network to ETH staking via mETH Protocol and bridging Bitcoin with Ignition FBTC, they’re building a connected decentralized economy.\n\nBacked by a $4B Treasury and powered by $MNT,…",
    tweet_id: "1881749832143946002",
    like: 6,
    retweet: 0,
    reply: 1,
  },
  {
    tweet: "ansem did nothing wrong",
    tweet_id: "1881695176714014913",
    like: 250,
    retweet: 12,
    reply: 96,
  },
  {
    tweet: "JUST IN: #Bitcoin reclaims $104,000 💥\n https://t.co/4tdmQP0wa2",
    tweet_id: "1881677287336382886",
    like: 8116,
    retweet: 1239,
    reply: 428,
  },
  {
    tweet:
      "Imagine thinking Bitcoin has topped when Trump just bought $47m wrapped $BTC\n\nHIGHER... 🚀",
    tweet_id: "1881741035224916258",
    like: 915,
    retweet: 95,
    reply: 82,
  },
  {
    tweet:
      "If you want to become a better trader focus on finding one really good opportunity/trade each month. Too many end up losing all their money overtrading or becoming over exposed that by the time a really good trade presents itself they don't have capital to play it.",
    tweet_id: "1881451557268668843",
    like: 1094,
    retweet: 90,
    reply: 79,
  },
  {
    tweet: "gm pre-rich frends",
    tweet_id: "1881605258738295059",
    like: 430,
    retweet: 64,
    reply: 258,
  },
  {
    tweet: "the world is coming onchain 🌎🌍🌏",
    tweet_id: "1881699385727496660",
    like: 5819,
    retweet: 587,
    reply: 1155,
  },
  {
    tweet: "Low MC memecoin to $1 billion MC 💰",
    tweet_id: "1881647677819244733",
    like: 125,
    retweet: 34,
    reply: 278,
  },
  {
    tweet: "It’s coming \n\nI can feel it https://t.co/fkFD1J53k2",
    tweet_id: "1881637207259464034",
    like: 3965,
    retweet: 391,
    reply: 450,
  },
  {
    tweet: "What’s your TOP 1 crypto GEM?? 💎🔝",
    tweet_id: "1881391238060122194",
    like: 184,
    retweet: 47,
    reply: 305,
  },
  {
    tweet:
      "What are we buying on @tamadotmeme?\n\nSo far I have:\nRLP\nRONER \nKANSTAR\nKOKU\nCOCO\nCK\nFZYORI\nPOTATO\n\nAnything missing?",
    tweet_id: "1881721552519266467",
    like: 64,
    retweet: 9,
    reply: 52,
  },
  {
    tweet: "gaming category on kaito soon imo",
    tweet_id: "1881739108101632403",
    like: 30,
    retweet: 3,
    reply: 12,
  },
  {
    tweet:
      "Kaito rigged the game to win.\n\nEveryone is incentivized to support them.",
    tweet_id: "1881430278599757883",
    like: 167,
    retweet: 6,
    reply: 92,
  },
  {
    tweet: "Is it too late to GM? ☀️ https://t.co/fgqKLL67QJ",
    tweet_id: "1881655637211599192",
    like: 597,
    retweet: 34,
    reply: 445,
  },
  {
    tweet:
      "🚨 RUMOR ALERT: $TRUMP TO SIGN 3 CRYPTO RELATED EXECUTIVE ORDERS TODAY 🇺🇸 https://t.co/wgesxP86Mn",
    tweet_id: "1881735158765949354",
    like: 2480,
    retweet: 476,
    reply: 361,
  },
  {
    tweet:
      "The Trumps met the Bidens at the White House, exchanging greetings on the day Donald Trump will be sworn in as the 47th president inside the US Capitol.\n\nWATCH LIVE\nhttps://t.co/CtC9YWf3Vx https://t.co/QLb4DD1v8t",
    tweet_id: "1881363622263493090",
    like: 162544,
    retweet: 17069,
    reply: 5711,
  },
  {
    tweet:
      "JUST IN: The official D.O.G.E. website is now live featuring the $DOGE logo. https://t.co/gjRXSvQxrh",
    tweet_id: "1881671002054447179",
    like: 2637,
    retweet: 398,
    reply: 142,
  },
];

const performLearningAndTweets = async () => {
  await loginTwitter();
  const twitterFeedData = tweets;
  console.log(twitterFeedData);
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

  // console.log("Response from agent", response.output);

  // Helper function to add delay
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

  await craftDetailedTweet(twitterFeedData.toString());
  // await delay(60000); // 1 minute delay

  // // Process tokens with a delay

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
  // }const delay = (ms: number) =>
  //   new Promise((resolve) => setTimeout(resolve, ms));

  // var tokenArray = await getTokenArray();
};

// performLearningAndTweets();
