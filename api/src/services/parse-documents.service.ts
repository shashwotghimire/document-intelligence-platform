import { PDFParse } from "pdf-parse";
import { parse } from "csv-parse/sync";
import mammoth from "mammoth";

export async function extractText(
  fileBuffer: Buffer,
  fileType: "pdf" | "docx" | "txt" | "csv",
): Promise<string> {
  if (fileType === "pdf") {
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (fileType === "csv") {
    const csvText = fileBuffer.toString("utf-8");

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
    const rawText = await mammoth.extractRawText({ buffer: fileBuffer });
    return rawText.value;
  }

  if (fileType === "txt") {
    const rawText = fileBuffer.toString("utf-8");
    return rawText;
  }

  throw new Error("Unsupported file type");
}
