import * as fs from "fs";
import * as path from "path";

const filePath = path.join(__dirname, "personality.txt"); // Replace with your .txt file path

// Read the file asynchronously

export const converttxtintoText = (filename: string) => {
  const filePath = path.join(__dirname, filename);
  console.log("filePath", filePath);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }
    console.log("File content:", data);
  });

  // Alternatively, read the file synchronously
  try {
    const data = fs.readFileSync(filePath, "utf8");
    console.log("File content (sync):", data);
    return data;
  } catch (err) {
    console.error("Error reading the file:", err);
  }
};
