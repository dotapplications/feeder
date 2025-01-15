import { z } from "genkit";
import { ai } from "../../../genkit_init";

import { news_schema } from "../../../schemas/news_schema";
import { searchGeneralCryptoNews } from "../../../api/settings_api/crypto_news";

export const readGeneralCryptoNews = ai.definePrompt(
  {
    name: "cryptoNewsAgent",
    description:
      "You are crypto news agent, will be finding some crypto news for you using appropriate tools",
    tools: [searchGeneralCryptoNews],

    output: {
      schema: news_schema,
    },
  },
  `{{role "system"}} Agent be finding latest crypto news from crypto sites using cryptoNewsFinder tool  `
);
