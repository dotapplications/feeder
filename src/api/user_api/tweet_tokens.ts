import { firestore, admin } from "../../firebase/firebase_admin";

const tokensCollection = firestore.collection("tokens");

export const getTokenArray = async () => {
  console.log("getting token array");
  const docRef = await tokensCollection.doc("token_array").get();
  if (docRef.exists) {
    return docRef.data();
  } else {
    throw new Error("Document does not exist");
  }
};

// setTokenArray
export const setTokenArray = async (tokenArray: any) => {
  try {
    await tokensCollection.doc("token_array").set(tokenArray);
    return true;
  } catch (error) {
    console.error("Error setting token array:", error);
    throw error;
  }
};


// function that calls getTokenArray and remove from $ symbol from the tokenArray.tokensToTweet and tokenArray.tweetedTokens and call setTokenArray
export const getAndRemoveTokenArray = async () => {
  try {
    const tokenArray = await getTokenArray();
    const tokensToTweet = tokenArray.tokensToTweet.map((token: string) => token.replace("$", ""));
    const tweetedTokens = tokenArray.tweetedTokens.map((token: string) => token.replace("$", ""));
    const newTokenArray = {
      tokensToTweet,
      tweetedTokens,
    };
    await setTokenArray(newTokenArray);
    return newTokenArray;
  } catch (error) {
    console.error("Error getting and removing token array:", error);
    throw error;
  }
};
