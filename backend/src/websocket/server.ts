import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import { registerNotificationConnection } from "../services/notification.service";

interface ConnectedUser {
  ws: WebSocket;
  userId: string;
  role: Role;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not configured");
}

const connectedUsers: ConnectedUser[] = [];

const sendToAll = (message: unknown) => {
  const data = JSON.stringify(message);

  for (const user of connectedUsers) {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(data);
    }
  }
};

const canReceiveActivity = async (
  user: ConnectedUser,
  taskId: string
): Promise<boolean> => {
  if (user.role === Role.ADMIN) {
    return true;
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      developerId: true,
      project: {
        select: {
          managerId: true,
        },
      },
    },
  });

  if (!task) {
    return false;
  }

  if (user.role === Role.DEVELOPER) {
    return task.developerId === user.userId;
  }

  if (user.role === Role.PROJECT_MANAGER) {
    return task.project.managerId === user.userId;
  }

  return false;
};

export const setupWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  wss.on("connection", async (ws, request) => {
    try {
      const url = new URL(
        request.url || "",
        `http://${request.headers.host}`
      );

      const token = url.searchParams.get("token");

      if (!token) {
        ws.close(1008, "Authentication required");
        return;
      }

      const decoded = jwt.verify(token, ACCESS_SECRET) as {
        userId: string;
      };

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        ws.close(1008, "User not found");
        return;
      }

      const connectedUser: ConnectedUser = {
        ws,
        userId: user.id,
        role: user.role,
      };

      connectedUsers.push(connectedUser);

      registerNotificationConnection(ws, user.id);

      ws.send(
        JSON.stringify({
          type: "CONNECTED",
          message: "WebSocket connected successfully",
        })
      );

      const recentActivities = await prisma.activityLog.findMany({
        where:
          user.role === Role.ADMIN
            ? {}
            : user.role === Role.PROJECT_MANAGER
              ? {
                  task: {
                    project: {
                      managerId: user.id,
                    },
                  },
                }
              : {
                  task: {
                    developerId: user.id,
                  },
                },
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

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "MISSED_ACTIVITIES",
            activities: recentActivities,
          })
        );
      }

      sendToAll({
        type: "USER_ONLINE",
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      });

      ws.on("close", () => {
        const index = connectedUsers.indexOf(connectedUser);

        if (index !== -1) {
          connectedUsers.splice(index, 1);
        }

        sendToAll({
          type: "USER_OFFLINE",
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        });
      });
    } catch {
      ws.close(1008, "Invalid or expired access token");
    }
  });

  console.log("WebSocket server running on /ws");

  return wss;
};

export const broadcastActivity = async (
  activity: {
    taskId: string;
    [key: string]: unknown;
  }
) => {
  for (const user of connectedUsers) {
    if (user.ws.readyState !== WebSocket.OPEN) {
      continue;
    }

    const allowed = await canReceiveActivity(
      user,
      activity.taskId
    );

    if (!allowed) {
      continue;
    }

    user.ws.send(
      JSON.stringify({
        type: "ACTIVITY_CREATED",
        activity,
      })
    );
  }
};