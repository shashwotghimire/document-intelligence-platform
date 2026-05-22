import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_PROMPT!,
});

export const generateAnswer = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
};

export async function* streamResponse(prompt: string) {
  const result = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  for await (const chunk of result) {
    const chunkText = chunk.text;
    if (chunkText) {
      yield chunkText;
    }
  }
}
