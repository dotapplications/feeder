import { Scraper, SearchMode } from "agent-twitter-client";
import { Cookie } from "tough-cookie"; // Add this import

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { log } from "console";

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

export const sentLongTweet = async (tweet: string) => {
  try {
    await scraper.sendLongTweet(tweet);
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

    // add the new json into the reponsetweets array
    responseTweets.push({
      tweet: legacy.full_text,
      tweet_id: legacy.conversation_id_str,
      like: legacy.favorite_count,
      retweet: legacy.retweet_count,
      reply: legacy.reply_count,
    });

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
  await loginTwitter();
  const response = await scraper.likeTweet(tweetId);

  console.log(response);
};

export const retweetTweet = async (tweetId: string) => {
  await loginTwitter();
  const response = await scraper.retweet(tweetId);

  console.log(response);
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
  await loginTwitter();
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
