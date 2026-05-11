import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export async function chunkDocument(rawText: string): Promise<string[]> {
  return splitter.splitText(rawText);
}
