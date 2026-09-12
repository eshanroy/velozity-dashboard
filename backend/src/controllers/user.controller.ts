import { Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: "User not found",
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch {
    res.status(500).json({
      error: "Failed to fetch current user",
    });
  }
};

export const getDevelopers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    const developers = await prisma.user.findMany({
      where: {
        role: Role.DEVELOPER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({
      developers,
    });
  } catch {
    res.status(500).json({
      error: "Failed to fetch developers",
    });
  }
};