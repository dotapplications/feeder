import { z } from "genkit";

export const news_schema = z.object({
  knowledge: z.array(
    z.object({
      topic: z.string(),
      details: z.string(),
    })
  ),
  activity_summary: z.string().describe("summary of the activity"),
  observation: z.string().describe("observations "),
});
