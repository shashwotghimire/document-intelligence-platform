import { NextFunction, Request, Response } from "express";
import type { UserRole } from "../models/user.model";
import { AuthRequest } from "./auth.middleware";
import { ApiError } from "../utils/ApiError";

export const rolesGuard = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    try {
      if (!authReq.user) {
        throw new ApiError(401, "Unauthorized", "User not authenticated");
      }

      if (!allowedRoles.includes(authReq.user.role)) {
        throw new ApiError(403, "Forbidden", "You do not have permission");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
