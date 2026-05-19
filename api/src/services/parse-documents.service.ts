import { PDFParse } from "pdf-parse";
import fs from "fs/promises";
import { parse } from "csv-parse/sync";

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

  throw new Error("Unsupported file type");
}
