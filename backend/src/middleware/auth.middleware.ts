import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not configured");
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Access token required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, ACCESS_SECRET) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({
        error: "User not found",
      });
      return;
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({
      error: "Invalid or expired access token",
    });
  }
};