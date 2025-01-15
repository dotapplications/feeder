import { ai } from "../../genkit_init";
import { createObservations } from "./observations_agent";
import { createReflections } from "./tools/update_reflections";
import { updatePersonality } from "./tools/update_personality";
import { Document } from "genkit/retriever";
import { createTweet } from "./tools/create_tweet_agent_api";
import { createHeadline } from "./tools/create_headline";

export const feederAgent = async (userInput: string, docs: Document[]) => {
  const { text } = await ai.generate({
    tools: [
      createTweet,
      createObservations,
      createReflections,
      updatePersonality,
      createHeadline,

      // createReflections,
      // createAppPost,
      // update_task_schedules,
    ],

    prompt: `
  You are acting as a helpful AI assistant that can do
  tasks considering the personality described at Genkit Grub Pub.
  task: ${userInput} `,
    docs,
  });

  console.log(text);
};
