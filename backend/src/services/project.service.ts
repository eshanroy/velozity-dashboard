import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";

interface CreateProjectInput {
  name: string;
  description?: string;
  clientId: string;
  managerId: string;
}

interface UpdateProjectInput {
  name?: string;
  description?: string;
  clientId?: string;
}

export const createProject = async (
  input: CreateProjectInput,
  currentUserId: string,
  currentUserRole: Role
) => {
  if (
    currentUserRole !== Role.ADMIN &&
    currentUserRole !== Role.PROJECT_MANAGER
  ) {
    throw new AppError(
      "Only Admin or Project Manager can create projects",
      403
    );
  }

  const manager = await prisma.user.findUnique({
    where: {
      id: input.managerId,
    },
  });

  if (!manager || manager.role !== Role.PROJECT_MANAGER) {
    throw new AppError("Invalid Project Manager", 400);
  }

  const client = await prisma.client.findUnique({
    where: {
      id: input.clientId,
    },
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  if (
    currentUserRole === Role.PROJECT_MANAGER &&
    input.managerId !== currentUserId
  ) {
    throw new AppError(
      "Project Manager can only create projects for themselves",
      403
    );
  }

  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      clientId: input.clientId,
      managerId: input.managerId,
    },
    include: {
      client: true,
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const getProjects = async (
  currentUserId: string,
  currentUserRole: Role
) => {
  const where =
    currentUserRole === Role.PROJECT_MANAGER
      ? { managerId: currentUserId }
      : {};

  return prisma.project.findMany({
    where,
    include: {
      client: true,
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      tasks: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateProject = async (
  projectId: string,
  input: UpdateProjectInput,
  currentUserId: string,
  currentUserRole: Role
) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (
    currentUserRole === Role.PROJECT_MANAGER &&
    project.managerId !== currentUserId
  ) {
    throw new AppError(
      "You can only update your own projects",
      403
    );
  }

  if (input.clientId) {
    const client = await prisma.client.findUnique({
      where: {
        id: input.clientId,
      },
    });

    if (!client) {
      throw new AppError("Client not found", 404);
    }
  }

  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name: input.name,
      description: input.description,
      clientId: input.clientId,
    },
    include: {
      client: true,
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const deleteProject = async (
  projectId: string,
  currentUserId: string,
  currentUserRole: Role
) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (
    currentUserRole === Role.PROJECT_MANAGER &&
    project.managerId !== currentUserId
  ) {
    throw new AppError(
      "You can only delete your own projects",
      403
    );
  }

  const taskCount = await prisma.task.count({
    where: {
      projectId,
    },
  });

  if (taskCount > 0) {
    throw new AppError(
      "Cannot delete a project that contains tasks",
      400
    );
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  return {
    message: "Project deleted successfully",
  };
};