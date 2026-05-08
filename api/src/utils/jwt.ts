import jwt from "jsonwebtoken";
import "dotenv/config";
import type { UserRole } from "../models/user.model";

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  isBlocked: boolean;
}
export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
