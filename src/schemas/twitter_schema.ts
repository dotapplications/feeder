import { z } from "genkit";

export const twitter_schema = z.object({
  tokens_to_track: z.array(
    z.object({
      token_symbol: z.string(),
      details: z.string(),
    })
  ),
  narratives_to_track: z.array(
    z.object({
      narrative: z.string(),
      details: z.string(),
    })
  ),
  topics_to_track: z.array(
    z.object({ topic: z.string(), details: z.string() })
  ),

  // user_to_follow: z
  //   .string()
  //   .describe(
  //     "be selective, and only if it needed, follow the user whith more reach(like good views, retweets, likes)"
  //   )
  //   .optional(),
  tweets_ids_to_like: z.array(
    z
      .string()
      .describe(
        "if it is an good tweet according to my personality, if it is small reach (less than 10k views)"
      )
  ),

  tweets_to_reply: z
    .array(
      z.object({
        tweet: z.string(),
        tweet_id: z.string(),
      })
    )
    .describe("latest tweet, and alligned to my personality"),

  activity_summary: z.string().describe("summary of the activity"),
  observation: z.string().describe("observations "),
});

export const twitter_schema_home = z.object({
  knowledge: z
    .array(
      z.object({
        topic: z.string(),
        details: z.string(),
      })
    )
    .describe("Knowledge learned from the tweet"),
  tokens: z.array(
    z.object({
      token: z.string(),
      details: z.string(),
    })
  ),
  topics: z.array(z.string()).describe("topic you feels interesting"),
  tweet_id_to_retweet: z
    .string()
    .describe(
      "id of the tweet you feels need to retweet, it is optional only retweet if you feels it is good, be selective"
    ),
  // user_to_follow: z
  //   .string()
  //   .describe(
  //     "user to follow, only if you feels his tweet are good and you want to follow him, be selective"
  //   )
  //   .optional(),
  tweet_id_to_like: z
    .string()
    .describe(
      "id of the tweet you feels need to like, it is optional only like if you feels it is good, be selective"
    )
    .optional(),

  tweet_to_reply: z
    .object({
      tweet: z.string(),
      my_reply: z.string(),
      tweet_id: z.string(),
    })
    .describe("Do retweet only if you feels necessory")
    .optional(),

  activity_summary: z.string().describe("summary of the activity"),
  observation: z.string().describe("observations "),
});

export const twitter_schema_search = z.object({
  token_details: z.object({
    token: z.string(),
    details: z.string(),
  }),
  topic_details: z.object({
    topic: z.string(),
    details: z.string(),
  }),
  tweet_id_to_like: z
    .string()
    .describe(
      "id of the tweet you feels need to like, it is optional only like if you feels it is good, be selective"
    )
    .optional(),

  tweet_to_reply: z
    .object({
      tweet: z.string(),
      tweet_id: z.string(),
    })
    .describe("reply to the tweet only if you feels necessory")
    .optional(),

  activity_summary: z.string().describe("summary of the activity"),
  observation: z.string().describe("observations "),
});

export const token_searched_schema = z.object({
  token_tracked: z.object({
    token_symbol: z.string(),
    details: z.string(),
    observation: z.string(),
    activity_summary: z.string(),
  }),
});

export const topic_searched_schema = z.object({
  narrative_tracked: z.object({
    topic: z.string(),
    details: z.string(),
    observation: z.string(),
    activity_summary: z.string(),
  }),
});

export const narrative_searched_schema = z.object({
  narrative_tracked: z.object({
    narrative: z.string(),
    details: z.string(),
    observation: z.string(),
    activity_summary: z.string(),
  }),
});

export const tweet_schema = z.object({
  tweet: z
    .string()
    .describe(
      "tweet content should be less than 270 characters, dont't use hashtags, you can use emojis if you want to express your feelings."
    ),
  activity_summary: z
    .string()
    .describe("summary of the activity to store in my experience memory"),
  observation: z
    .string()
    .describe(
      "observations from of the activity to store in my experience memory"
    ),
});

export const long_tweet_schema = z.object({
  tweet_thread: z
    .string()
    .describe(
      " should be less than 550 charcters, dont't use hashtags,  it should be formated with line sepration on content for better readabiliy.  you can use emojis if you want (not mandatory) ."
    ),
  activity_summary: z
    .string()
    .describe("summary of the activity to store in my experience memory"),
  observation: z
    .string()
    .describe(
      "observations from of the activity to store in my experience memory"
    ),
});

export const new_launch_token_schema = z.object({
  tweet: z
    .string()
    .describe(
      " it should be detailed tweet, should be less than 500 charcters, dont't use hashtags,"
    ),
  token_symbol_tweeted: z
    .string()
    .describe("should be start with $ and capital letter"),
});
