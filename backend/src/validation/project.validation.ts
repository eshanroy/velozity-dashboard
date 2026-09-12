import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters"),

  description: z
    .string()
    .optional(),

  clientId: z
    .string()
    .min(1, "Client ID is required"),

  managerId: z
    .string()
    .min(1, "Manager ID is required"),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .optional(),

  description: z
    .string()
    .optional(),

  clientId: z
    .string()
    .min(1, "Client ID is required")
    .optional(),
});