// const DEFAULT_FRONTEND_ORIGIN = "https://documentgpt.shashwotghimire.com.np";
const DEFAULT_FRONTEND_ORIGIN = "http://localhost:5173";

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, "");

const configuredFrontendOrigin =
  process.env.FRONTEND_ORIGIN || process.env.CLIENT_URL || process.env.WEB_URL;

export const frontendOrigin = normalizeOrigin(
  configuredFrontendOrigin || DEFAULT_FRONTEND_ORIGIN,
);

export const allowedFrontendOrigins = Array.from(
  new Set(
    [
      "http://localhost:5173",
      DEFAULT_FRONTEND_ORIGIN,
      "https://www.documentgpt.shashwotghimire.com.np",
      configuredFrontendOrigin,
    ]
      .filter((origin): origin is string => Boolean(origin))
      .map(normalizeOrigin),
  ),
);
