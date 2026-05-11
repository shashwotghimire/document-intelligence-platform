import { PDFParse } from "pdf-parse";
import fs from "fs/promises";

export async function extractText(
  filePath: string,
  fileType: "pdf" | "docx" | "txt",
): Promise<string> {
  if (fileType === "pdf") {
    const parser = new PDFParse({ url: filePath });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  throw new Error("Unsupported file type");
}
