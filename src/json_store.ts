import { promises as fs } from "fs";
import path from "path"; // Import the path module
import { SessionData, SessionStore } from "genkit";

export class JsonSessionStore<S = any> implements SessionStore<S> {
  private basePath: string;

  constructor(basePath?: string) {
    // If no basePath is provided, default to "chats" folder in the parent directory
    this.basePath = basePath || path.resolve(__dirname, "../../chats");
  }

  async get(sessionId: string): Promise<SessionData<S> | undefined> {
    try {
      const filePath = path.join(this.basePath, `${sessionId}.json`);
      const s = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(s);
      return data;
    } catch {
      return undefined;
    }
  }

  async save(sessionId: string, sessionData: SessionData<S>): Promise<void> {
    try {
      const filePath = path.join(this.basePath, `${sessionId}.json`);
      const s = JSON.stringify(sessionData, null, 2); // Pretty-print JSON for easier debugging

      // Ensure the directory exists
      await fs.mkdir(this.basePath, { recursive: true });

      // Write the file
      await fs.writeFile(filePath, s, "utf8");
    } catch (error) {
      console.error("Failed to save session data:", error);
    }
  }
}
