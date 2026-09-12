import { api } from "./client";

export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data.projects;
};

export const createProject = async (projectData: {
  name: string;
  description?: string;
  clientId: string;
  managerId: string;
}) => {
  const response = await api.post(
    "/projects",
    projectData
  );

  return response.data.project;
};

export const updateProject = async (
  projectId: string,
  projectData: {
    name?: string;
    description?: string;
    clientId?: string;
  }
) => {
  const response = await api.patch(
    `/projects/${projectId}`,
    projectData
  );

  return response.data.project;
};

export const deleteProject = async (
  projectId: string
) => {
  const response = await api.delete(
    `/projects/${projectId}`
  );

  return response.data;
};

export const getClients = async () => {
  const response = await api.get("/clients");
  return response.data.clients;
};

export const getDevelopers = async () => {
  const response = await api.get("/user/developers");
  return response.data.developers;
};

export const getTasks = async () => {
  const response = await api.get("/tasks");
  return response.data.tasks;
};

export const createTask = async (taskData: {
  title: string;
  description?: string;
  projectId: string;
  developerId: string;
  priority?: string;
  dueDate: string;
}) => {
  const response = await api.post(
    "/tasks",
    taskData
  );

  return response.data.task;
};

export const updateTask = async (
  taskId: string,
  taskData: {
    title?: string;
    description?: string;
    developerId?: string;
    priority?: string;
    dueDate?: string;
    isOverdue?: boolean;
  }
) => {
  const response = await api.patch(
    `/tasks/${taskId}`,
    taskData
  );

  return response.data.task;
};

export const deleteTask = async (
  taskId: string
) => {
  const response = await api.delete(
    `/tasks/${taskId}`
  );

  return response.data;
};

export const updateTaskStatus = async (
  taskId: string,
  status: string
) => {
  const response = await api.patch(
    `/tasks/${taskId}/status`,
    { status }
  );

  return response.data.task;
};

export const getActivities = async () => {
  const response = await api.get("/activities");
  return response.data.activities;
};

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data.notifications;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get(
    "/notifications/unread-count"
  );

  return response.data.count;
};

export const markNotificationAsRead = async (
  notificationId: string
) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch(
    "/notifications/read-all"
  );

  return response.data;
};