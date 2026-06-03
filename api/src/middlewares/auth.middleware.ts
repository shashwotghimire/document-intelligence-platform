import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { User, type UserRole } from "../models/user.model";

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

export const authMiddleware = async (
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
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new ApiError(401, "Unauthorized", "Invalid or missing token");
    }
    if (user.isBlocked) {
      throw new ApiError(403, "Account blocked", "User account is blocked");
    }
    if (!user.isEmailVerified) {
      throw new ApiError(403, "Forbidden", "Please verify your email first");
    }
    (req as AuthRequest).user = decoded;
    next();
  } catch (e) {
    next(e);
  }
};
