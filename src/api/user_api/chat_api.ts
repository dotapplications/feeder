import express from "express";
import { genkit } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";
// import Redis from "ioredis";
import { SessionStore, SessionData } from "genkit";
import { ai } from "../../genkit_init";
import { JsonSessionStore } from "../../json_store";
import { devLocalRetrieverRef } from "@genkit-ai/dev-local-vectorstore";
import { retrivePersonalityMemory } from "../../memory/peronality_memory";
import { retriveAllMemoriesContext } from "../settings_api/memory_invocation_tools";

const userRouter = express.Router();

userRouter.use(express.json());

// Session management endpoints
userRouter.post("/chat/session", async (req, res) => {
  try {
    const session = ai.createSession({
      store: new JsonSessionStore(),
      initialState: {
        userId: req.body.userId,
        createdAt: new Date().toISOString(),
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Chat message endpoint
userRouter.post("/chat/:sessionId/message", async (req, res) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  console.log("req.body", req.params);

  const { sessionId } = req.params;
  const { message } = req.body;

  try {
    const memory = await retriveAllMemoriesContext(message);

    const feeder_terminal = ai.definePrompt(
      {
        name: "feeder_terminal",
        description: "Your job is to help the users with questions",
      },
      `{{role "system"}}, You are acting as a helpful AI assistant that can help people with their questions. You are giving insights and info regarding trading crypto, trending narratives, and other happenings in the crypto industry`
    );

    // Load existing session
    const session = await ai.loadSession(sessionId, {
      store: new JsonSessionStore(),
    });

    if (!session) {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: "Session not found",
          done: true,
        })}\n\n`
      );
      return res.end();
    }

    // Create chat instance for this session
    const chat = session.chat(feeder_terminal);

    let fullResponse = "";

    try {
      const { response, stream } = await chat.sendStream(
        `context:${JSON.stringify(
          memory
        )} consider above context to answer the below question, question: \n ${message}`
      );

      // Using the streaming API
      for await (const chunk of stream) {
        // Send each chunk to the client
        res.write(
          `data: ${JSON.stringify({
            type: "chunk",
            content: chunk.text,
            done: false,
          })}\n\n`
        );

        fullResponse += chunk.text;
      }

      // Save the complete response to session history
      await response;

      // Send completion message
      res.write(
        `data: ${JSON.stringify({
          type: "done",
          content: fullResponse,
          done: true,
        })}\n\n`
      );
    } catch (streamError) {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: "Streaming error occurred",
          done: true,
        })}\n\n`
      );
    } finally {
      res.end(); // End the SSE response
    }
  } catch (error) {
    console.error("Error processing message:", error);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        error: "Failed to process message",
        done: true,
      })}\n\n`
    );
    res.end();
  }
});

// // Error handling middleware
// router.use(
//   (
//     err: Error,
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     console.error("Unhandled error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// );

export default userRouter;
