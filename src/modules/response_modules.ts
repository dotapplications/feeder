// the is the module that will be used to handle the response from the agent

import { GenerateResponse, z } from "genkit";
import { indexExperienceMemory } from "../memory/experience_memory";
import { addTradingFeed } from "../api/user_api/trading_feeds";
import { indexPersonalityMemory } from "../memory/peronality_memory";
import { indexEntityMemory } from "../memory/entity_memory";
import { createTweetAPI } from "../api/user_api/twitter-eliza";
import { indexReflectionsMemory } from "../memory/reflections_memory";
import { followUser } from "../api/user_api/twitter-eliza";
import { retweetTweet } from "../api/user_api/twitter-eliza";
import { likeTweet } from "../api/user_api/twitter-eliza";
import { createQuestion } from "./initial_planning_module";
import { storeQuestionIntoDB } from "../api/user_api/questions_firebase";

interface TokenToTrack {
  token_symbol: string;
  details: string;
}

interface TopicToTrack {
  topic: string;
  details: string;
}

interface NarrativeToTrack {
  narrative: string;
  details: string;
}

interface ResponseData {
  tweet?: string;
  news?: string[];
  knowledge?: {
    topic: string;
    details: string;
  }[];
  question?: string;
  token_tracked?: TokenToTrack;
  tweet_thread?: string;
  narrative_tracked?: NarrativeToTrack;
  topic_tracked?: TopicToTrack;
  tokens_to_track?: TokenToTrack[];
  topics_to_track?: TopicToTrack[];
  narratives_to_track?: NarrativeToTrack[];
  user_to_follow?: string;
  tweet_id_to_retweet?: string;
  tweet_id_to_like?: string;
  tweet_to_reply?: {
    tweet: string;
    my_reply: string;
    tweet_id: string;
  };
  headline?: string;
  knowledge_update?: string;
  activity_summary?: string;
  observation?: string;
  updated_personality?: string;
  reflections?: string[];
}

export const handleAgentResponse = async (response: GenerateResponse<any>) => {
  const output: ResponseData = response.output;
  console.log("Output:", output);

  try {
    if (output) {
      // Loop through all properties in the output object
      for (const key in output) {
        if (Object.prototype.hasOwnProperty.call(output, key)) {
          switch (key) {
            case "knowledge":
              if (Array.isArray(output[key])) {
                let knowledge = "";
                output[key].forEach((item) => {
                  knowledge += `Knowledge: ${item.topic} - ${item.details}\n`;
                });
                console.log(knowledge);
                await indexEntityMemory(knowledge);
              }
              break;

            case "tweet_thread":
              // Handle tweet
              console.log("Creating tweet:", output[key]);
              const tweet_thread = `${output[key]}`;
              await createTweetAPI(tweet_thread);

              break;
            case "tweet":
              // Handle tweet
              console.log("Creating tweet:", output[key]);
              const tweet = `${output[key]}`;
              await createTweetAPI(tweet);

              break;
            case "narratives_to_track":
              // Handle narratives to track
              console.log("Creating narratives to track:", output[key]);
              var narratives = ``;
              output[key].forEach((item) => {
                narratives += `
                latest tracking narrative: ${item.narrative} - ${item.details}\n
                `;
              });
              console.log(narratives);
              // Save narratives to memory
              await indexEntityMemory(narratives);
            case "tokens_to_track":
              // Handle tokens to track
              console.log("Creating tokens to track:", output[key]);

              if (Array.isArray(output[key])) {
                let tokens = "";
                (output[key] as TokenToTrack[]).forEach((item) => {
                  tokens += `Latest tracking token: ${item.token_symbol} - ${item.details}\n`;
                });
                console.log(tokens);
                await indexEntityMemory(tokens);
              }

              break;

            case "topics_to_track":
              if (Array.isArray(output[key])) {
                let topics = "";
                (output[key] as TopicToTrack[]).forEach((item) => {
                  topics += `Latest tracking topic: ${item.topic} - ${item.details}\n`;
                });
                console.log(topics);
                await indexEntityMemory(topics);
              }
              break;
            case "token_tracked":
              // Handle token tracked
              console.log("Creating token tracked:", output[key]);
              const tokenTracked = `
               Searched about token: $${output[key].token_symbol} - ${
                output[key].details
              }
               Date of search: ${new Date().toDateString()}
              `;
              // Save token tracked to memory
              await indexEntityMemory(tokenTracked);
              break;
            case "narratives_to_track":
              if (Array.isArray(output[key])) {
                let narratives = "";
                (output[key] as NarrativeToTrack[]).forEach((item) => {
                  narratives += `Latest tracking narrative: ${item.narrative} - ${item.details}\n`;
                });
                console.log(narratives);
                await indexEntityMemory(narratives);
              }
              break;

            case "topic_tracked":
              // Handle topic tracked
              console.log("Creating topic tracked:", output[key]);
              const topicTracked = `
                Topic Tracked: ${output[key].topic} - ${output[key].details}
              `;
              // Save topic tracked to memory
              await indexEntityMemory(topicTracked);
              break;
            case "activity_summary":
              // Handle activity summary
              console.log("Creating activity summary:", output[key]);
              const activitySummary = `
                Activity Summary: ${output[key]}
              `;
              // Save activity summary to memory
              await indexExperienceMemory(activitySummary);
              break;
            case "observation":
              // Handle observation
              console.log("Creating observation:", output[key]);
              const observation = `
                Observation: ${output[key]}
              `;
              // Save observation to memory
              await indexExperienceMemory(observation); // Save observation to memory
              break;
            case "headline":
              // Handle headlines
              console.log("Creating headlines:", output[key]);
              await addTradingFeed(output[key]);
              break;
            case "user_to_follow":
              // Handle user to follow
              console.log("Creating user to follow:", output[key]);
              if (output[key]) await followUser(output[key]);

            case "reflections":
              // Handle reflections
              console.log("Creating reflections:", output[key]);
              const reflections = `
                Reflections: ${output[key]}
              `;
              console.log(reflections);
              // Save reflections to memory
              await indexReflectionsMemory(reflections);
              break;
            case "question":
              // Handle question
              console.log("Creating question:", output[key]);

              storeQuestionIntoDB(output[key]);
              break;
            case "tweet_id_to_retweet":
              // Handle tweet id to retweet
              console.log("Retweeting tweet:", output[key]);
              if (output[key]) await retweetTweet(output[key]);
              break;
            case "tweet_id_to_like":
              // Handle tweet id to like
              console.log("Liking tweet:", output[key]);
              if (output[key]) await likeTweet(output[key]);
              break;
            case "updated_personality":
              // Handle personality update
              console.log("Updating personality:", output[key]);
              const personalityUpdate = `\n
               ${output[key]}
              `;
              // Save personality update to memory
              await indexPersonalityMemory(personalityUpdate);
              break;
            default:
              console.warn("Unhandled key:", key);
              break;
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
