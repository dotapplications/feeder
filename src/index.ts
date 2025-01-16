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
  loginTwitter,
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
  craftingTweetAboutToken,
  createNewsHealines,
  createQuestion,
  createReflectionsAPI,
  giveReplyToTweet,
  performLearning,
  performLearningAboutToken,
  performLearningAndTweet,
  scheduleJobs,
} from "./modules/initial_planning_module";

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
// performLearningAndTweet();
// createReflectionsAPI();
// giveReplyToTweet();
// createNewsHealines();

app.listen(3333, () => {
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
