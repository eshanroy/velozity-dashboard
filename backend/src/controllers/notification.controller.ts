import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service";

export const getNotificationsController = async (
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

    const notifications = await getNotifications(
      req.user.userId
    );

    res.status(200).json({
      notifications,
    });
  } catch {
    res.status(500).json({
      error: "Failed to fetch notifications",
    });
  }
};

export const getUnreadNotificationCountController = async (
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

    const count = await getUnreadNotificationCount(
      req.user.userId
    );

    res.status(200).json({
      count,
    });
  } catch {
    res.status(500).json({
      error: "Failed to fetch unread notification count",
    });
  }
};

export const markNotificationAsReadController = async (
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

    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({
        error: "Notification id is required",
      });
      return;
    }

    const notification = await markNotificationAsRead(
      id,
      req.user.userId
    );

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to mark notification as read";

    res.status(404).json({
      error: message,
    });
  }
};

export const markAllNotificationsAsReadController = async (
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

    const result = await markAllNotificationsAsRead(
      req.user.userId
    );

    res.status(200).json({
      message: "All notifications marked as read",
      count: result.count,
    });
  } catch {
    res.status(500).json({
      error: "Failed to mark all notifications as read",
    });
  }
};