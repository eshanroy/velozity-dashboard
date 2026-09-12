import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../services/project.service";

export const createProjectController = async (
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
      name,
      description,
      clientId,
      managerId,
    } = req.body;

    const project = await createProject(
      {
        name,
        description,
        clientId,
        managerId,
      },
      req.user.userId,
      req.user.role
    );

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create project";

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

export const getProjectsController = async (
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

    const projects = await getProjects(
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      projects,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch projects";

    res.status(500).json({
      error: message,
    });
  }
};

export const updateProjectController = async (
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

    const projectId = req.params.id as string;

    if (!projectId) {
      res.status(400).json({
        error: "Project id is required",
      });
      return;
    }

    const {
      name,
      description,
      clientId,
    } = req.body;

    const project = await updateProject(
      projectId,
      {
        name,
        description,
        clientId,
      },
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update project";

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

export const deleteProjectController = async (
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

    const projectId = req.params.id as string;

    if (!projectId) {
      res.status(400).json({
        error: "Project id is required",
      });
      return;
    }

    const result = await deleteProject(
      projectId,
      req.user.userId,
      req.user.role
    );

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete project";

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