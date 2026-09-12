import { Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getActivityLogs = async (
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

    let where = {};

    if (req.user.role === Role.DEVELOPER) {
      where = {
        task: {
          developerId: req.user.userId,
        },
      };
    }

    if (req.user.role === Role.PROJECT_MANAGER) {
      where = {
        task: {
          project: {
            managerId: req.user.userId,
          },
        },
      };
    }

    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
            developerId: true,
            project: {
              select: {
                id: true,
                name: true,
                managerId: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    res.status(200).json({
      activities,
    });
  } catch {
    res.status(500).json({
      error: "Failed to fetch activity logs",
    });
  }
};