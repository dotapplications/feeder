export const memories: string[] = [
  "personality_memory",
  "entity_memory",
  "reflections_memory",
  "experience_memory",
];
interface ToolDefinition {
  name: string;
  description: string;
  subTools: string[];
}

export const tools = [
  "createTweet",
  "readGeneralCryptoNews",
  "createHeadline",
  "createReflections",
  "updatePersonality",
  "readTwitterFeeds",
  "searchTwitter",
  "searchForTopicorProtcol",
  "searchTwitterAboutToken",
];

export const toolDefinitions: Record<string, ToolDefinition> = {
  createTweet: {
    name: "createTweet",
    description: "Manages tweet creation and posting",
    subTools: [],
  },

  createHeadline: {
    name: "createHeadline",
    description:
      "You will create a headlines of of the day, for showing to people",
    subTools: [],
  },
  readGeneralCryptoNews: {
    name: "readGeneralCryptoNews",
    description:
      "You will be reading general crypto news, it will be last 4 hours news",
    subTools: [],
  },
  createReflections: {
    name: "createReflections",
    description:
      "Creates reflections based on experiences and observations you have, or is there any new belief or interest emerging",
    subTools: [],
  },
  readTwitterFeeds: {
    name: "readTwitterFeeds",
    description:
      "This tool will read the twitter feed for you, latest 30 tweets",
    subTools: ["readTwitterFeed"],
  },
  searchTwitter: {
    name: "searchTwitter",
    description:
      "search about an topic, or protocol, or about an tokens(using token Symbol), this will tool will used expand your entitly memory (your knowledge) or for gathering new knowledge",
    subTools: ["searchForTopicorProtcol", "searchTwitterAboutToken"],
  },
  updatePersonality: {
    name: "updatePersonality",
    description:
      "Decide on personality updates by checking for consistent patterns, significant changes, personal growth, or new recurring interests.",
    subTools: [],
  },
  // Add other tool definitions
};

export const capabilities = [
  "create tweet using my knowledge about an topic or token",
  "Searching twitter for expanding my knowledge about an specific topic, protocol or token",
  "reviewing personality",
  "find latest crypto news in last 4 hours",
  "Crafting reflections based on on past activities and observations, it may be some goal updates, interests or hobbies updates, conclutions about state of the world ",
  "creating news headline",
  "reading tweets",
];
