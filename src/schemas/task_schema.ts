import { z } from "genkit";

export const taskSchema = z.object({
  task_id: z.string(),
  objective: z.string(),
  task_prompt: z.string().describe("consider the capabilities and constraints"),
  executionTime: z.string().describe("should be in HH:mm"), //  format
});

export const nestedToolSchema = z.object({
  name: z.string(),
  subTools: z.array(z.string()).optional(),
  description: z.string(),
});
