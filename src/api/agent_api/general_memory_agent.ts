import { twitter_schema } from "../../schemas/twitter_schema";
import { ai } from "../../genkit_init";
import { retriveAllMemoriesContext } from "../settings_api/memory_invocation_tools";
import { GenerateResponse } from "genkit";

export const craftTweetSummary = async (
  prompt: string
): Promise<GenerateResponse<any>> => {
  const docs = await retriveAllMemoriesContext(prompt);
  const response = await ai.generate({
    prompt: prompt,
    docs,
    output: {
      schema: twitter_schema,
    },
  });

  return response;
};
