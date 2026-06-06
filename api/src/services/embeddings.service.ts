import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MIN_INTERVAL_MS = Number(
  process.env.EMBEDDING_MIN_INTERVAL_MS ?? 750,
);
const EMBEDDING_MAX_RETRIES = Number(process.env.EMBEDDING_MAX_RETRIES ?? 3);

let embeddingQueue = Promise.resolve();
let lastEmbeddingRequestAt = 0;

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelayMs = (error: unknown, attempt: number) => {
  const fallbackDelayMs = Math.min(2 ** attempt * 1000, 30000);
  const message = error instanceof Error ? error.message : "";

  try {
    const parsed = JSON.parse(message);
    const retryDelay = parsed.error?.details?.find(
      (detail: { "@type"?: string }) =>
        detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo",
    )?.retryDelay;

    if (typeof retryDelay === "string" && retryDelay.endsWith("s")) {
      return Number(retryDelay.slice(0, -1)) * 1000;
    }
  } catch {
    return fallbackDelayMs;
  }

  return fallbackDelayMs;
};

const runWithEmbeddingThrottle = async <T>(operation: () => Promise<T>) => {
  const previous = embeddingQueue;
  let releaseQueue: () => void = () => {};

  embeddingQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previous;

  try {
    const elapsed = Date.now() - lastEmbeddingRequestAt;

    if (elapsed < EMBEDDING_MIN_INTERVAL_MS) {
      await sleep(EMBEDDING_MIN_INTERVAL_MS - elapsed);
    }

    lastEmbeddingRequestAt = Date.now();
    return await operation();
  } finally {
    releaseQueue();
  }
};

export const generateEmbedding = async (content: string) => {
  const ai = getGeminiClient();

  for (let attempt = 0; attempt <= EMBEDDING_MAX_RETRIES; attempt += 1) {
    try {
      const response = await runWithEmbeddingThrottle(() =>
        ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: content,
        }),
      );

      const embedding = response.embeddings?.[0]?.values;

      if (!embedding) {
        throw new Error("Embedding response did not include values");
      }

      return embedding;
    } catch (error: any) {
      if (error?.status !== 429 || attempt === EMBEDDING_MAX_RETRIES) {
        throw error;
      }

      const retryDelayMs = getRetryDelayMs(error, attempt);
      lastEmbeddingRequestAt = Date.now() + retryDelayMs;
      await sleep(retryDelayMs);
    }
  }

  throw new Error("Embedding generation failed");
};
