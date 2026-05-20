import { PDFParse } from "pdf-parse";
import fs from "fs/promises";
import { parse } from "csv-parse/sync";
import mammoth from "mammoth";

export async function extractText(
  filePath: string,
  fileType: "pdf" | "docx" | "txt" | "csv",
): Promise<string> {
  if (fileType === "pdf") {
    const parser = new PDFParse({ url: filePath });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (fileType === "csv") {
    const csvText = await fs.readFile(filePath, "utf-8");

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    return records
      .map((row) =>
        Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", "),
      )
      .join("\n");
  }

  if (fileType === "docx") {
    const rawText = await mammoth.extractRawText({ path: filePath });
    console.log(rawText);
    return rawText.value;
  }

  throw new Error("Unsupported file type");
}
