export const parseFollowUpQuestions = (raw: string | undefined): string[] => {
  try {
    if (!raw) {
      return [];
    }
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      return parsed.filter((q): q is string => typeof q === "string");
    }

    return [];
  } catch {
    return [];
  }
};

export const normalizeGeneratedTitle = (title?: string) => {
  return title
    ?.trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(0, 6)
    .join(" ");
};
