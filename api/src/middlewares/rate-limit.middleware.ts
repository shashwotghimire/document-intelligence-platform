import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Allow normal app usage with polling and dashboard refetches.
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Too many requests. Please try again shortly.",
    error: "Rate limit exceeded",
  },
  // store: ... , // Redis, Memcached, etc. See below.
});
