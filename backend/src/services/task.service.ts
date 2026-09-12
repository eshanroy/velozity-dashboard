import { Role, TaskPriority, TaskStatus } from "@prisma/client";
import prisma from "../config/prisma";
import { broadcastActivity } from "../websocket/server";
import { createNotification } from "./notification.service";
import { AppError } from "../utils/AppError";

interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  developerId: string;
  priority?: TaskPriority;
  dueDate: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  developerId?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export const createTask = async (
  input: CreateTaskInput,
  currentUserId: string,
  currentUserRole: Role
) => {
  if (
    currentUserRole !== Role.ADMIN &&
    currentUserRole !== Role.PROJECT_MANAGER
  ) {
    throw new AppError(
      "Only Admin or Project Manager can create tasks",
      403
    );
  }

  const project = await prisma.project.findUnique({
    where: {
      id: input.projectId,
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
      "You can only create tasks for your own projects",
      403
    );
  }

  const developer = await prisma.user.findUnique({
    where: {
      id: input.developerId,
    },
  });

  if (!developer || developer.role !== Role.DEVELOPER) {
    throw new AppError("Invalid developer", 400);
  }

  const dueDate = new Date(input.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 400);
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      developerId: input.developerId,
      priority: input.priority ?? TaskPriority.MEDIUM,
      dueDate,
      status: TaskStatus.TODO,
      isOverdue: dueDate < new Date(),
    },
    include: {
      project: true,
      developer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await createNotification({
    userId: input.developerId,
    type: "TASK_ASSIGNED",
    message: `You have been assigned a new task: ${task.title}`,
  });

  return task;
};

export const getTasks = async (
  currentUserId: string,
  currentUserRole: Role
) => {
  let where = {};

  if (currentUserRole === Role.DEVELOPER) {
    where = {
      developerId: currentUserId,
    };
  }

  if (currentUserRole === Role.PROJECT_MANAGER) {
    where = {
      project: {
        managerId: currentUserId,
      },
    };
  }

  return prisma.task.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          managerId: true,
        },
      },
      developer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      activityLogs: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateTaskStatus = async (
  taskId: string,
  newStatus: TaskStatus,
  currentUserId: string,
  currentUserRole: Role
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (
    currentUserRole === Role.DEVELOPER &&
    task.developerId !== currentUserId
  ) {
    throw new AppError(
      "You can only update your own assigned tasks",
      403
    );
  }

  if (
    currentUserRole === Role.PROJECT_MANAGER
  ) {
    const project = await prisma.project.findUnique({
      where: {
        id: task.projectId,
      },
    });

    if (!project || project.managerId !== currentUserId) {
      throw new AppError(
        "You can only update tasks from your own projects",
        403
      );
    }
  }

  if (task.status === newStatus) {
    throw new AppError(
      "Task is already in this status",
      400
    );
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status: newStatus,
    },
  });

  const activity = await prisma.activityLog.create({
    data: {
      taskId: task.id,
      userId: currentUserId,
      oldStatus: task.status,
      newStatus,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          projectId: true,
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
  });

  await broadcastActivity(activity);

  if (newStatus === TaskStatus.IN_REVIEW) {
    const project = await prisma.project.findUnique({
      where: {
        id: task.projectId,
      },
      select: {
        managerId: true,
      },
    });

    if (project) {
      await createNotification({
        userId: project.managerId,
        type: "TASK_IN_REVIEW",
        message: `Task "${task.title}" has been moved to review.`,
      });
    }
  }

  return updatedTask;
};

export const updateTask = async (
  taskId: string,
  input: UpdateTaskInput,
  currentUserId: string,
  currentUserRole: Role
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (
    currentUserRole === Role.DEVELOPER &&
    task.developerId !== currentUserId
  ) {
    throw new AppError(
      "You can only update your own assigned tasks",
      403
    );
  }

  if (
    currentUserRole === Role.PROJECT_MANAGER &&
    task.project.managerId !== currentUserId
  ) {
    throw new AppError(
      "You can only update tasks from your own projects",
      403
    );
  }

  if (
    input.developerId
  ) {
    const developer = await prisma.user.findUnique({
      where: {
        id: input.developerId,
      },
    });

    if (
      !developer ||
      developer.role !== Role.DEVELOPER
    ) {
      throw new AppError(
        "Invalid developer",
        400
      );
    }
  }

  let dueDate: Date | undefined;

  if (input.dueDate) {
    dueDate = new Date(input.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      throw new AppError(
        "Invalid due date",
        400
      );
    }
  }

  return prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      title: input.title,
      description: input.description,
      developerId: input.developerId,
      priority: input.priority,
      dueDate,
      isOverdue: dueDate
        ? dueDate < new Date() &&
          task.status !== TaskStatus.DONE
        : task.isOverdue,
    },
    include: {
      project: true,
      developer: {
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

export const deleteTask = async (
  taskId: string,
  currentUserId: string,
  currentUserRole: Role
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (
    currentUserRole === Role.DEVELOPER &&
    task.developerId !== currentUserId
  ) {
    throw new AppError(
      "You can only delete your own assigned tasks",
      403
    );
  }

  if (
    currentUserRole === Role.PROJECT_MANAGER &&
    task.project.managerId !== currentUserId
  ) {
    throw new AppError(
      "You can only delete tasks from your own projects",
      403
    );
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return {
    message: "Task deleted successfully",
  };
};