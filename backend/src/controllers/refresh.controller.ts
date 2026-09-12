import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  generateAccessToken,
  verifyRefreshToken,
} from "../utils/jwt";

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        error: "Refresh token required",
      });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);

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

    const accessToken = generateAccessToken(
      user.id,
      user.role
    );

    res.status(200).json({
      accessToken,
    });
  } catch {
    res.status(401).json({
      error: "Invalid or expired refresh token",
    });
  }
};