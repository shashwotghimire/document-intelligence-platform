import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_PROMPT!,
});

export const generateAnswer = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  return response.text;
};
