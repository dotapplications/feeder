import { z } from "genkit";
import { ai } from "../../genkit_init";
import { searchTwitterAPI } from "../user_api/twitter-eliza";
import { fetchLastFourHourNews } from "../user_api/general_crypto_news";
import { news_schema } from "../../schemas/news_schema";

export const searchGeneralCryptoNews = ai.defineTool(
  {
    name: "cryptoNewsFinder",
    description: "searching for crypto news",
    inputSchema: z.object({
      scrap: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (query: any): Promise<string> => {
    console.log("Inside the searching of news", query);
    var newsString = await fetchLastFourHourNews();
    console.log("searching done: news: " + newsString);
    return newsString;
  }
);
