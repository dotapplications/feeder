import { firestore, admin } from "../../firebase/firebase_admin";

const newsCollection = firestore.collection("news");

// const fetch latest crypto news
export const fetchLastFourHourNews = async () => {
  console.log("fetching Last2DaysNewsWithHighestIndexScore");
  try {
    const now = new Date();

    const fourHoursAgo = new Date(now.getTime() - 7 * 60 * 60 * 1000);

    // // const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    // // const startOfTwoDaysAgo = new Date(twoDaysAgo.setHours(0, 0, 0, 0));
    // console.log("twoDaysAgo", twoDaysAgo);
    // console.log("now", now);
    const docRef = await newsCollection
      .where("isSpeculative", "==", false)
      .where("created_at", ">=", fourHoursAgo)
      .where("created_at", "<=", now)
      .orderBy("created_at", "desc")
      .get();

    console.log(docRef);

    const news: any[] = [];

    docRef.forEach((doc) => {
      console.log(doc.data());
      news.push({
        news_title: doc.data().title,
        news_content: doc.data().summary,
        photo_url: doc.data().photo,
      });
    });

    console.log(JSON.stringify(news));

    // const recencyWeight = await getRecencyWeight();

    // const sortedNews = news.sort((a, b) => {
    //   const now = Date.now();
    //   const hoursAgoA = (now - a.created_at._seconds * 1000) / (1000 * 60 * 60);
    //   const hoursAgoB = (now - b.created_at._seconds * 1000) / (1000 * 60 * 60);

    //   const finalScoreA = a.index_score - hoursAgoA * recencyWeight;
    //   const finalScoreB = b.index_score - hoursAgoB * recencyWeight;

    //   return finalScoreB - finalScoreA;
    // });
    // const sortedNews = news.sort((a, b) => {
    //   // Compare index_score first
    //   if (b.index_score !== a.index_score) {
    //     return b.index_score - a.index_score;
    //   }

    //   // If index_score is the same, compare created_at (newer articles first)
    //   return (
    //     new Date(b.created_at._seconds * 1000) -
    //     new Date(a.created_at._seconds * 1000)
    //   );
    // });
    //console the length of the news
    // console.log("Total news in 48 hours fetched from db: ", news.length);

    return JSON.stringify(news);
  } catch (error) {
    console.error(
      "Error fetching fetchLast2DaysNewsWithHighestIndexScore:",
      error
    );
    throw error;
  }
};
