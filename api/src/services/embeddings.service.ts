import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
};

export const generateEmbedding = async (content: string) => {
  const ai = getGeminiClient();

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error("Embedding response did not include values");
  }

  return embedding;
};
