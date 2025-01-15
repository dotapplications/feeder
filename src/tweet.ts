const { TwitterApi } = require("twitter-api-v2");
const dotenv = require("dotenv");
dotenv.config();
const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
  bearerToken: process.env.TWITTER_BEARER_TOKEN,
});

interface ApiError extends Error {
  code?: number;
  data?: {
    title?: string;
    detail?: string;
  };
}

export async function testTwitterCredentials() {
  try {
    // Verify credentials are correctly formatted
    console.log("Checking Twitter API Credentials...");

    // Ensure all required credentials are present
    const requiredCredentials = [
      "TWITTER_APP_KEY",
      "TWITTER_APP_SECRET",
      "TWITTER_ACCESS_TOKEN",
      "TWITTER_ACCESS_SECRET",
    ];

    requiredCredentials.forEach((credential) => {
      if (!process.env[credential]) {
        console.error(`❌ Missing credential: ${credential}`);
        throw new Error(`Missing ${credential} environment variable`);
      }
    });

    const client = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY!,
      appSecret: process.env.TWITTER_APP_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    // Attempt to get user information to verify credentials
    const userV2 = await client.v2.me();
    console.log("✅ Authentication Successful!");
    console.log("User ID:", userV2.data.id);
    console.log("Username:", userV2.data.username);
  } catch (error) {
    console.error("❌ Authentication Failed");

    // Type-safe error handling
    if (error instanceof Error) {
      // Check if it's an ApiError with a code
      const apiError = error as ApiError;

      if (apiError.code === 401) {
        console.log("Detailed 401 Error Analysis:");
        console.log("1. Incorrect API credentials");
        console.log("2. Tokens have been revoked");
        console.log("3. Insufficient API access level");
        console.log("4. App does not have write permissions");

        // Log additional error details if available
        if (apiError.data) {
          console.log("Error Title:", apiError.data.title);
          console.log("Error Detail:", apiError.data.detail);
        }
      }

      // Log the full error for debugging
      console.error("Full Error:", apiError);
    } else {
      // Handle any other type of error
      console.error("An unexpected error occurred:", error);
    }
  }
}

// function to tweet
export async function postTweet(tweetContent: string) {
  // Input validation
  if (!tweetContent || typeof tweetContent !== "string") {
    throw new Error("Tweet content must be a non-empty string");
  }

  // Check if tweet content is within Twitter's character limit
  if (tweetContent.length > 280) {
    throw new Error("Tweet content exceeds 280 characters");
  }

  try {
    // Verify client authentication before attempting to tweet
    const me = await client.v2.me();

    const { data: createdTweet } = await client.v2.tweet({
      text: tweetContent,
    });

    console.log("Tweet posted successfully!");
    console.log(`Tweet ID: ${createdTweet.id}`);
    return createdTweet.id;
  } catch (error: any) {
    // Handle specific error cases
    if (error.code === 403) {
      throw new Error(
        "Authorization error: Your app may not have write permissions. " +
          "Please check your Twitter Developer Portal settings and ensure you have Tweet write permissions enabled."
      );
    } else if (error.code === 401) {
      throw new Error(
        "Authentication failed: Please verify your API keys and tokens are correct and not expired."
      );
    }

    // Log the full error for debugging
    console.error("Detailed error:", JSON.stringify(error, null, 2));

    // Re-throw the error with a more specific message
    throw new Error(
      `Failed to post tweet: ${error.message || "Unknown error"}`
    );
  }
}
