import { z } from "genkit";

export const headline_schema = z.object({
  headline: z.string().describe("News headline"),
  activity_summary: z.string().describe("summary of the activity").optional(),
});
