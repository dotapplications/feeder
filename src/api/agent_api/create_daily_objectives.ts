import { ai } from "../../genkit_init";
import { z } from "genkit";
import {
  getEntityMemory,
  getExperienceMemory,
  getPersonalityMemory,
  getReflectionsMemory,
  retriveAllMemoriesContext,
} from "../settings_api/memory_invocation_tools";
import { nestedToolSchema } from "../../schemas/task_schema";
import { toolDefinitions } from "../../config/agent_config";
import {
  capabilitiesInreadableFormat,
  toolDefinisitionsStringified,
} from "../../utils";

export const createDailyObjective = async (): Promise<string[]> => {
  const currentDate = new Date();

  const systemPrompt = ` You are a daily planning assistant that creates objectives .
  Current Date: ${currentDate}
  Current Time: ${currentDate.toLocaleTimeString()}
 
  `;

  const prompt = `
  Consider my capabilities and constraints as follows:
  ${capabilitiesInreadableFormat()}
  `;

  console.log(prompt);

  // retrive relevent memories as context
  const docs = await retriveAllMemoriesContext(`${systemPrompt}\n${prompt}`);

  const objectiveResponse = await ai.generate({
    system: systemPrompt,
    output: {
      schema: z.array(z.string()),
    },
    prompt,
    docs,
  });

  return objectiveResponse.output as string[];
};
