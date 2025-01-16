import {
  gemini10Pro,
  gemini15Flash,
  gemini15Flash8b,
  gemini15Pro,
  gemini20FlashExp,
  googleAI,
} from "@genkit-ai/googleai";
import { chromeDB } from "./memory/init_memory";
import { textEmbedding004, vertexAI } from "@genkit-ai/vertexai";
import { genkit } from "genkit";
import { chroma } from "genkitx-chromadb";

export const ai = genkit({
  plugins: [googleAI(), vertexAI(), chromeDB],
  model: gemini15Flash, // set default model
});
