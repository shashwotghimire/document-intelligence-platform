import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import type { UserRole } from "../models/user.model";

interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  isBlocked: boolean;
}

export interface AuthRequest extends Request {
  user: TokenPayload;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeaders = req.headers.authorization;
    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized", "Invalid or missing token");
    }
    const token = authHeaders.split(" ")[1];
    if (!token)
      throw new ApiError(401, "Unauthorized", "Invalid or missing token");
    const decoded = verifyToken(token) as TokenPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch (e) {
    next(e);
  }
};
