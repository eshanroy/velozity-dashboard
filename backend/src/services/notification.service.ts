import { NotificationType } from "@prisma/client";
import prisma from "../config/prisma";
import { WebSocket } from "ws";

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  message: string;
}

interface ConnectedNotificationUser {
  ws: WebSocket;
  userId: string;
}

const connectedNotificationUsers: ConnectedNotificationUser[] = [];

export const registerNotificationConnection = (
  ws: WebSocket,
  userId: string
) => {
  const connection = {
    ws,
    userId,
  };

  connectedNotificationUsers.push(connection);

  ws.on("close", () => {
    const index = connectedNotificationUsers.indexOf(connection);

    if (index !== -1) {
      connectedNotificationUsers.splice(index, 1);
    }
  });
};

const sendToUser = (
  userId: string,
  message: unknown
) => {
  const data = JSON.stringify(message);

  for (const connection of connectedNotificationUsers) {
    if (
      connection.userId === userId &&
      connection.ws.readyState === WebSocket.OPEN
    ) {
      connection.ws.send(data);
    }
  }
};

const sendUnreadCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  sendToUser(userId, {
    type: "UNREAD_COUNT_UPDATED",
    count,
  });
};

export const createNotification = async (
  input: NotificationPayload
) => {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
    },
  });

  sendToUser(input.userId, {
    type: "NOTIFICATION_CREATED",
    notification,
  });

  await sendUnreadCount(input.userId);

  return notification;
};

export const getNotifications = async (
  userId: string
) => {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getUnreadNotificationCount = async (
  userId: string
) => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  const updatedNotification =
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

  await sendUnreadCount(userId);

  return updatedNotification;
};

export const markAllNotificationsAsRead = async (
  userId: string
) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  await sendUnreadCount(userId);

  return result;
};