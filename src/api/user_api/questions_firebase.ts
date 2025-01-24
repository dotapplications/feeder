import { firestore, admin } from "../../firebase/firebase_admin";

const constentCollection = firestore.collection("constants");

var colors = ["1A0000FF", "1A00FF00", "1A800080", "1AFFA500"];
var emoji = ["💹", "📊", "💰", "💹"];

var questionsPostionArray = [
  "question1",
  "question2",
  "question3",
  "question4",
];

// const fetch latest crypto news
export const storeQuestionIntoDB = async (question: string) => {
  // choose random color
  var color = colors[Math.floor(Math.random() * colors.length)];
  var emojito = emoji[Math.floor(Math.random() * emoji.length)];

  const docRef = constentCollection.doc("chat_questions");

  // in the chat_questions we have 4 questions, choose a random position and inseart in the form of
  // question1: {question: "What is the price of bitcoin", color: "1A0000FF", emoji: "💹"}
  var questionPosition =
    questionsPostionArray[
      Math.floor(Math.random() * questionsPostionArray.length)
    ];
  await docRef.update({
    [questionPosition]: {
      question: question,
      bgColor: color,
      emoji: emojito,
    },
  });

  console.log("Question added");
};

export const storeLastFetchedDateTime = async (lastFetchedDateTime: string) => {
  const docRef = constentCollection.doc("aixbt");
  await docRef.set({
    lastFetchedDateTime: lastFetchedDateTime,
  });
  console.log("Last fetched date time added");
};

export const fetchLastFetchedDateTime = async () => {
  const docRef = constentCollection.doc("aixbt");
  const doc = await docRef.get();
  if (!doc.exists) {
    console.log("No such document!");
    return null;
  } else {
    console.log("Document data:", doc.data());
    return doc.data();
  }
};

//
