import { z } from "genkit";
import { ai } from "../../genkit_init";
import { taskSchema } from "../../schemas/task_schema";
import { nestedToolSchema } from "../../schemas/task_schema";
import { toolDefinitions } from "../../config/agent_config";
import { toolDefinisitionsStringified } from "../../utils";
import { retriveAllMemoriesContext } from "../settings_api/memory_invocation_tools";

export const optimiseDailyTasks = async (tasks: any): Promise<string[]> => {
  const currentDate = new Date();

  const systemPrompt = `
    You are a daily schedule optimizer. Arrange tasks considering:
    1. Time of day preferences
    2. Task dependencies
    3. Tool availability and constraints
    4. Regular daily patterns

    Current Time: ${currentDate.toLocaleTimeString()}
    Tool Constraints: ${toolDefinisitionsStringified()}
  `;

  const prompt = `
    Optimize this daily task sequence:
    ${JSON.stringify(tasks)}
  `;

  const memoriesForObjective = await retriveAllMemoriesContext(
    `${systemPrompt}\n${prompt}\n`
  );

  const response = await ai.generate({
    system: systemPrompt,
    output: {
      schema: z.array(taskSchema),
    },
    prompt,
    docs: memoriesForObjective,
  });

  return response.output as string[];
};
