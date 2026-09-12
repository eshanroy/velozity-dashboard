import { z } from "zod";
import {
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(2, "Task title must be at least 2 characters"),

  description: z
    .string()
    .optional(),

  projectId: z
    .string()
    .min(1, "Project ID is required"),

  developerId: z
    .string()
    .min(1, "Developer ID is required"),

  priority: z
    .nativeEnum(TaskPriority)
    .optional(),

  dueDate: z
    .string()
    .datetime({
      message: "Invalid due date",
    }),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(2, "Task title must be at least 2 characters")
    .optional(),

  description: z
    .string()
    .optional(),

  developerId: z
    .string()
    .min(1, "Developer ID is required")
    .optional(),

  priority: z
    .nativeEnum(TaskPriority)
    .optional(),

  dueDate: z
    .string()
    .datetime({
      message: "Invalid due date",
    })
    .optional(),

  isOverdue: z
    .boolean()
    .optional(),
});