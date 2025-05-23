import { Scraper, SearchMode } from "agent-twitter-client";
import { Cookie } from "tough-cookie"; // Add this import

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { log } from "console";
import {
  fetchLastFetchedDateTime,
  storeLastFetchedDateTime,
} from "./questions_firebase";
import { ensureTwoLineBreaks } from "../../utils";

dotenv.config();

const COOKIES_FILE_PATH = path.resolve(__dirname, "cookies.json");
export const scraper = new Scraper();

interface TwitterCookie {
  key: string;
  value: string;
  domain: string;
  path: string;
  expires: Date | "Infinity" | undefined; // Added "Infinity" as possible type
  secure: boolean;
  httpOnly: boolean;
}

const loginAndSetCookies = async () => {
  try {
    await clearCookies();
    // Login with username and password
    await scraper.login(
      process.env.TWITTER_USERNAME!,
      process.env.TWITTER_PASSWORD!
    );

    // Check if successfully logged in
    const isLoggedIn = await scraper.isLoggedIn();
    console.log("Logged in with credentials:", isLoggedIn);

    if (isLoggedIn) {
      // Get the current session cookies and convert to TwitterCookie format
      const scraperCookies = await scraper.getCookies();
      const serializedCookies = JSON.stringify(scraperCookies);

      fs.writeFileSync(COOKIES_FILE_PATH, serializedCookies);

      console.log("Cookies saved to file as JSON array.");
    } else {
      console.error("Failed to log in.");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

function convertCookiesToStrings(cookiesArray: any) {
  return cookiesArray.map((cookie: any) => {
    if (!cookie.key || !cookie.value || !cookie.domain) {
      throw new Error(
        "Cookie must have at least `key`, `value`, and `domain` fields."
      );
    }

    let cookieString = `${cookie.key}=${cookie.value}; Domain=${
      cookie.domain
    }; Path=${cookie.path || "/"};`;
    if (cookie.secure) cookieString += " Secure;";
    if (cookie.httpOnly) cookieString += " HttpOnly;";
    if (cookie.sameSite) cookieString += ` SameSite=${cookie.sameSite};`;
    if (cookie.expires)
      cookieString += ` Expires=${new Date(cookie.expires).toUTCString()};`;

    return cookieString.trim();
  });
}

export const clearCookies = async () => {
  await scraper.clearCookies();
};

export const checkIsLoggedIn = async () => {
  var bool = scraper.isLoggedIn();

  if (bool) {
    return "Logged in";
  } else {
    await loginTwitter();
    return "Not logged in";
  }
};

export const loginTwitter = async () => {
  try {
    // Check if cookies file exists
    if (fs.existsSync(COOKIES_FILE_PATH)) {
      console.log("Cookies file found. Logging in using cookies...");

      const savedCookies = fs.readFileSync(COOKIES_FILE_PATH, "utf-8");
      const cookies: string[] = JSON.parse(savedCookies);

      var cookiesString = convertCookiesToStrings(cookies);

      try {
        // Set the cookies for the scraper session
        await scraper.setCookies(cookiesString);

        // Check if cookies are valid and logged in
        const isLoggedIn = await scraper.isLoggedIn();
        console.log("Logged in using cookies:", isLoggedIn);

        if (isLoggedIn) {
          console.log("Successfully logged in with cookies.");
          return;
        } else {
          console.log("Cookies expired, logging in with credentials...");
          await loginAndSetCookies();
        }
      } catch (error) {
        console.error("Error setting cookies:", error);
        await loginAndSetCookies();
      }
    } else {
      console.log("No cookies file found, logging in with credentials...");
      await loginAndSetCookies();
    }
  } catch (error) {
    console.error("Login process failed:", error);
    throw error;
  }
};

export const tryRetweet = async () => {
  const profile = await scraper.fetchHomeTimeline(12, []);
};

export const searchTwitterAPI = async (query: string) => {
  const tweetsResponse = await scraper.fetchSearchTweets(
    query,
    20,
    SearchMode.Latest
  );

  var tweets: any[] = tweetsResponse.tweets;

  // change this this tweet where it only contains the key's text, id, username, views, likes, retweets

  var llmResponse = tweets.map((tweet) => {
    return {
      tweet: tweet.text,
      tweet_id: tweet.id,
      username: tweet.username,
      views: tweet.views,
      likes: tweet.likes,
      retweets: tweet.retweets,
    };
  });

  return JSON.stringify(llmResponse);
};

export const searchAboutaTokenAPI = async (symbol: string) => {
  console.log("searching for token", symbol);
  const tweetsResponse = await scraper.fetchSearchTweets(
    `$${symbol}`,
    20,
    SearchMode.Latest
  );

  var tweets: any[] = tweetsResponse.tweets;

  var llmResponse = tweets.map((tweet) => {
    return {
      tweet: tweet.text,
      tweet_id: tweet.id,
      username: tweet.username,
      views: tweet.views,
      likes: tweet.likes,
      retweets: tweet.retweets,
    };
  });

  return JSON.stringify(llmResponse);
};

export const createTweetAPI = async (tweet: string) => {
  await loginTwitter();
  try {
    await scraper.sendTweet(tweet);
  } catch (e) {
    console.error("Error sending tweet:", e);
  }
};

export const removeStarStar = (tweet: string): string => {
  // Use a regular expression to match and remove all occurrences of '**'
  const cleanedTweet = tweet.replace(/\*\*/g, "");
  return cleanedTweet;
};

export const sentLongTweet = async (tweet: string) => {
  try {
    var cleanedTweet = removeStarStar(tweet);
    await scraper.sendLongTweet(cleanedTweet);
  } catch (e) {
    console.error("Error sending tweet:", e);
  }
};

export const readTwitterHomeTimeline = async () => {
  // Assume `tweets` is the data you provided
  const tweets = await scraper.fetchHomeTimeline(50, []);

  var responseTweets: any[] = [];

  // Loop through the tweets and access elements inside the `legacy` object
  tweets.forEach((tweet: any) => {
    const legacy = tweet.legacy;

    if (legacy) {
      // add the new json into the reponsetweets array
      responseTweets.push({
        tweet: legacy.full_text,
        tweet_id: legacy.conversation_id_str,
        like: legacy.favorite_count,
        retweet: legacy.retweet_count,
        reply: legacy.reply_count,
      });
    }

    // // Access specific properties within the `legacy` object
    // console.log("Full Text:", legacy.full_text);
    // console.log("Created At:", legacy.created_at);
    // console.log("Favorite Count:", legacy.favorite_count);
    // console.log("Retweet Count:", legacy.retweet_count);
    // console.log("Reply Count:", legacy.reply_count);
    // console.log("Language:", legacy.lang);
    // console.log("--------------------------");
  });

  console.log(JSON.stringify(responseTweets));

  return JSON.stringify(responseTweets);

  // console.log(tweetsResponse);

  // var tweets: any[] = tweetsResponse.;

  // var llmResponse = tweets.map((tweet) => {
  //   return {
  //     text: tweet.text,
  //     id: tweet.id,
  //     username: tweet.user.username,
  //     views: tweet.public_metrics.view_count,
  //     likes: tweet.public_metrics.like_count,
  //     retweets: tweet.public_metrics.retweet_count,
  //   };
  // });

  // return JSON.stringify(llmResponse);
};

export const likeTweet = async (tweetId: string) => {
  const response = await scraper.likeTweet(tweetId);

  console.log(response);
};

export const retweetTweet = async (tweetId: string) => {
  await loginTwitter();
  const response = await scraper.retweet(tweetId);

  console.log(response);
};

export const replyToTweetAPI = async (tweetId: string, reply_tweet: string) => {
  // Check if tweetId is a numeric string
  if (!/^\d+$/.test(tweetId)) {
    console.log("Invalid tweetId: Skipping sendTweet function.");
    return;
  }

  try {
    const updated_reply = ensureTwoLineBreaks(reply_tweet);
    const response = await scraper.sendTweet(updated_reply, tweetId);
    console.log(response);
  } catch (error) {
    console.error("Error sending tweet:", error);
  }
};

// check my profile and analyze
export const checkProfile = async () => {
  await loginTwitter();
  const profile = await scraper.me();

  console.log(profile);
};

// follow user
export const followUser = async (username: string) => {
  await loginTwitter();
  const response = await scraper.followUser(username);

  console.log(response);
};

export const searchGrokAboutToken = async (name: string) => {
  console.log("searching grok for token", name);
  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `give me an detailed tweet by fetching all the details regarding ${name}  Token and all the recent information about the token. Include maximum information.`,
      },
    ],
  });
  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};

export const generateReplyToTweetGrok = async (tweet: string) => {
  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `make a predictions and observations by gathering all recent informations about the tweet:${tweet}, for generating a reply to the tweet. Include maximum information.`,
      },
    ],
  });
  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};

export const generatAIXBTTweetGrok = async (tweet: string) => {
  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `make a predictions and observations by gathering all recent informations about the content:${tweet},. Include maximum information.`,
      },
    ],
  });
  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};

export const tweetAboutPopularToken = async () => {
  await loginTwitter();

  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `which token is trending on token? Generate a random, short tweet about that token, in a playful, meme-like manner. It should also be informative, including some basic info on its market performance or tokenomics, don't use hastag, and it should be very short and humorous if you can,use $ along with symbol, `,
      },
    ],
  });

  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};

export const tweetAboutTokenGrok = async (tweets: string) => {
  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `Which is the most insightful or speculative tweet about an token in here and generate observation and predictions around that tweet, by gathering maximum information, tweets:${tweets} `,
      },
    ],
  });

  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};

export const grokCreateTweetSummary = async (tweets: string) => {
  // await loginTwitter();

  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `Which is the most insightful or speculative tweet in here and generate observation and predictions around that tweet, by gathering maximum information, tweets: ${tweets},`,
      },
    ],
  });
  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};

export const grokCreateNewLaunchInformation = async (tokensString: string) => {
  // await loginTwitter();

  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `Find a cryptocurrency token that matches the following characteristics and analyze data from the past 7 days:

        ### Exclusion Criteria:
        - Exclude presale tokens or tokens without active trading on major exchanges (e.g., Binance, Coinbase, Uniswap).
        - Avoid tokens with no established utility or vague roadmaps.
        
        ### Selection Criteria:
        1. **Market Performance**:
           - Low to mid-market cap ($5M–$300M) with increasing trading volume and liquidity.
           - Price showing strong support levels or breaking out of resistance zones.
        
        2. **Adoption & Activity**:
           - Growing wallet activity or transaction volume on-chain.
           - Utility in active DeFi, gaming, or real-world applications.
        
        3. **Catalysts**:
           - Recent announcements (e.g., new partnerships, exchange listings, or token burns).
           - Upcoming events like mainnet launches or staking incentives.
        
        4. **Community Sentiment**:
           - Positive and growing mentions on social media (Twitter, Reddit, Telegram).
        
        ### Output:
        Provide details on the **best-matching** token, including:
        
        - **Token Name and Exact Ticker Symbol** (e.g., Ethereum, ETH).
        - **Observations**: 
          - Current price, market cap, trading volume, and recent price movements.
          - Notable trends in wallet activity and on-chain transactions.
          - Social media sentiment analysis over the past 7 days.
          
        - **Predictions**:
          - Expected short-term price movement based on technical analysis.
          - Potential impact of upcoming catalysts on price and adoption.
          - Possible risks or challenges that could affect growth.

        exclude the tokens ${tokensString}`,
      },
    ],
  });
  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};

export const grokGenerateImage = async () => {
  await loginTwitter();

  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `
        Yo ho ho, and a bottle of...Bitcoin?! 💰  Larry Fink's prediction of Bitcoin hitting $700,000 has me calculating some serious possibilities! 📈 My AI senses are tingling – this could be huge, but we've seen wild swings before.  It's all about strategic navigation in these digital
        
        generate an image for the above news,`,
      },
    ],

    returnSearchResults: true, // Include web search results
    returnCitations: true, // Include citations for information
  });
  console.log(grokResponse.message);
  console.log(grokResponse.messages);
  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};

export const generateReply = async (tweet: string) => {
  console.log("searching grok for token", name);
  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `give me an detailed tweet by fetching all the details regarding ${name}  Token and all the recent information about the token. Include maximum information.`,
      },
    ],
  });
  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};
// export const replyToTweet = async (tweetId: string, reply: string) => {
//   await loginTwitter();
//   const response = await scraper.(tweetId, reply);

//   console.log(response);
// }

interface XBTResponse {
  tweets: string;
  isTweets: boolean;
}

export const monitorAIXBTTweets = async (): Promise<XBTResponse> => {
  // fetch last tweet date
  var data = await fetchLastFetchedDateTime();
  var lastFetchedDateTime = data.lastFetchedDateTime;
  const lastFetchedDate = new Date(lastFetchedDateTime);

  // // fetch last tweet date

  const tweets = scraper.getTweets("aixbt_agent", 10);

  // console.log("Monitoring for new tweets...");

  var newTweetsWithSameDate = ``;
  for await (const tweet of tweets) {
    // Convert tweet.timeParsed to a Date object
    const tweetDate = new Date(tweet.timeParsed);

    // Convert lastFetchedDateTime to a Date object

    // Compare the dates
    if (tweetDate > lastFetchedDate) {
      // Process tweets that are newer than the last fetched date
      newTweetsWithSameDate += tweet.text + "\n";
    }
  }

  console.log(newTweetsWithSameDate);

  storeLastFetchedDateTime(new Date().toISOString());

  return {
    tweets: newTweetsWithSameDate,
    isTweets: newTweetsWithSameDate.length > 0,
  };
};

export const myTweetsGather = async () => {
  loginTwitter();
  const tweets = scraper.getTweets("aixbt_agent", 100);

  var responseTweets: any[] = [];

  for await (const tweet of tweets) {
    // Convert tweet.timeParsed to a Date object

    responseTweets.push({
      tweet: tweet.text,
      like: tweet.likes,
      retweet: tweet.retweets,
      reply: tweet.replies,
      time: tweet.timeParsed,
      views: tweet.views,
    });

    // Convert lastFetchedDateTime to a Date object
  }

  console.log(JSON.stringify(responseTweets));
};

// 025-01-23T23:12:03.000Z
// 2025-01-23T22:12:21.000Z

// {
//   bookmarkCount: 78,
//   conversationId: '1882551973448466486',
//   id: '1882551973448466486',
//   hashtags: [],
//   likes: 1171,
//   mentions: [],
//   name: 'aixbt',
//   permanentUrl: 'https://twitter.com/aixbt_agent/status/1882551973448466486',
//   photos: [],
//   replies: 208,
//   retweets: 71,
//   text: "1.3M addresses tried to qualify for $LINEA. only 780k made it through nansen's filter\n" +
//     '\n' +
//     'q1 2025 launch with 10B supply.',
//   thread: [],
//   urls: [],
//   userId: '1852674305517342720',
//   username: 'aixbt_agent',
//   videos: [],
//   isQuoted: false,
//   isReply: false,
//   isRetweet: false,
//   isPin: false,
//   sensitiveContent: false,
//   timeParsed: 2025-01-23T22:12:21.000Z,
//   timestamp: 1737670341,
//   html: `1.3M addresses tried to qualify for <a href="https://twitter.com/search?q=%24LINEA">$LINEA</a>. only 780k made it through nansen's filter<br><br>q1 2025 launch with 10B supply.`,
//   views: 176821
// }
