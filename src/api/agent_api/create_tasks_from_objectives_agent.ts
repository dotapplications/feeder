import { ai } from "../../genkit_init";
import { z } from "genkit";
import {
  getEntityMemory,
  getExperienceMemory,
  getPersonalityMemory,
  getReflectionsMemory,
  retriveAllMemoriesContext,
} from "../settings_api/memory_invocation_tools";
import { nestedToolSchema, taskSchema } from "../../schemas/task_schema";

import {
  capabilitiesInreadableFormat,
  toolDefinisitionsStringified,
} from "../../utils";

export const createTasksFromObjectives = async (
  objective: string
): Promise<string[]> => {
  const currentDate = new Date();

  const systemPrompt = `
    You are a task planning assistant that decomposes objectives into specific, actionable tasks.
    Current Time: ${currentDate.toLocaleTimeString()}
   
  `;

  const prompt = `
  Objective: ${objective}
  Consider tool capabilities and constraints:
  ${capabilitiesInreadableFormat()}
    Plan tasks considering:
    - Current time and daily schedule (shedule will be like 9:00 AM to 10:10 AM, 10:40 AM to 11:00 AM, etc.)
    - Task dependencies and timing
    - Memory context needed for each step
  `;

  const memoriesForObjective = await retriveAllMemoriesContext(
    `${systemPrompt}\n${prompt}`
  );

  const tasksResponse = await ai.generate({
    system: systemPrompt,
    output: {
      schema: z.array(taskSchema),
    },
    prompt,
    docs: memoriesForObjective,
  });

  return tasksResponse.output as string[];
};
