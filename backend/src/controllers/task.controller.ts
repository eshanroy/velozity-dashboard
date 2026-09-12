import { Response } from "express";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createTask,
  getTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../services/task.service";

export const createTaskController = async (
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

    const {
      title,
      description,
      projectId,
      developerId,
      priority,
      dueDate,
    } = req.body;

    const task = await createTask(
      {
        title,
        description,
        projectId,
        developerId,
        priority,
        dueDate,
      },
      req.user.userId,
      req.user.role
    );

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create task";

    const statusCode =
      error instanceof Error &&
      "statusCode" in error
        ? Number(error.statusCode)
        : 400;

    res.status(statusCode).json({
      error: message,
    });
  }
};

export const getTasksController = async (
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

    const tasks = await getTasks(
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch tasks";

    res.status(500).json({
      error: message,
    });
  }
};

export const updateTaskStatusController = async (
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
    const { status } = req.body;

    const task = await updateTaskStatus(
      id,
      status,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update task status";

    const statusCode =
      error instanceof Error &&
      "statusCode" in error
        ? Number(error.statusCode)
        : 400;

    res.status(statusCode).json({
      error: message,
    });
  }
};

export const updateTaskController = async (
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

    const {
      title,
      description,
      developerId,
      priority,
      dueDate,
    } = req.body;

    const task = await updateTask(
      id,
      {
        title,
        description,
        developerId,
        priority,
        dueDate,
      },
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update task";

    const statusCode =
      error instanceof Error &&
      "statusCode" in error
        ? Number(error.statusCode)
        : 400;

    res.status(statusCode).json({
      error: message,
    });
  }
};

export const deleteTaskController = async (
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

    const result = await deleteTask(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete task";

    const statusCode =
      error instanceof Error &&
      "statusCode" in error
        ? Number(error.statusCode)
        : 400;

    res.status(statusCode).json({
      error: message,
    });
  }
};