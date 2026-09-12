import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "./auth.middleware";

export const authorize = (...allowedRoles: Role[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };
};