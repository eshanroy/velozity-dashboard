import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import projectRoutes from "./routes/project.routes";
import clientRoutes from "./routes/client.routes";
import taskRoutes from "./routes/task.routes";
import activityRoutes from "./routes/activity.routes";
import notificationRoutes from "./routes/notification.routes";

import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use("/auth", authRoutes);

app.use("/user", userRoutes);

app.use("/projects", projectRoutes);

app.use("/clients", clientRoutes);

app.use("/tasks", taskRoutes);

app.use("/activities", activityRoutes);

app.use("/notifications", notificationRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Velozity Dashboard API",
    status: "Backend running successfully",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
  });
});

// Global error handler
app.use(errorHandler);

export default app;