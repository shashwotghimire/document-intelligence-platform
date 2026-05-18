import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 200,
});

export async function chunkDocument(rawText: string): Promise<string[]> {
  return splitter.splitText(rawText);
}
