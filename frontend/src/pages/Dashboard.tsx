import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getClients,
  getDevelopers,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getActivities,
  getNotifications,
  getUnreadNotificationCount,
  updateTaskStatus,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/dashboard";
import { useWebSocket } from "../utils/useWebSocket";

interface OnlineUser {
  id: string;
  name: string;
  role: string;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface Developer {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
  client?: Client;
  manager?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tasks?: any[];
}

const Dashboard = () => {
  const { user, accessToken } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [developers, setDevelopers] =
    useState<Developer[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] =
    useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] =
    useState<OnlineUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] =
    useState<string | null>(null);

  const [showCreateProject, setShowCreateProject] =
    useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] =
    useState("");
  const [projectClientId, setProjectClientId] =
    useState("");
  const [creatingProject, setCreatingProject] =
    useState(false);

  const [editingProjectId, setEditingProjectId] =
    useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] =
    useState("");
  const [
    editingProjectDescription,
    setEditingProjectDescription,
  ] = useState("");
  const [
    editingProjectClientId,
    setEditingProjectClientId,
  ] = useState("");
  const [updatingProjectId, setUpdatingProjectId] =
    useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] =
    useState<string | null>(null);

  const [showCreateTask, setShowCreateTask] =
    useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] =
    useState("");
  const [taskProjectId, setTaskProjectId] =
    useState("");
  const [taskDeveloperId, setTaskDeveloperId] =
    useState("");
  const [taskPriority, setTaskPriority] =
    useState("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [creatingTask, setCreatingTask] =
    useState(false);

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] =
    useState("");
  const [
    editingTaskDescription,
    setEditingTaskDescription,
  ] = useState("");
  const [editingTaskProjectId, setEditingTaskProjectId] =
    useState("");
  const [
    editingTaskDeveloperId,
    setEditingTaskDeveloperId,
  ] = useState("");
  const [editingTaskPriority, setEditingTaskPriority] =
    useState("MEDIUM");
  const [editingTaskDueDate, setEditingTaskDueDate] =
    useState("");
  const [updatingTaskDetailsId, setUpdatingTaskDetailsId] =
    useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] =
    useState<string | null>(null);

  const handleWebSocketMessage = useCallback(
    (data: any) => {
      console.log("WebSocket event:", data);

      if (data.type === "ACTIVITY_CREATED") {
        setActivities((current) =>
          [data.activity, ...current].slice(0, 20)
        );
      }

      if (data.type === "MISSED_ACTIVITIES") {
        setActivities(data.activities);
      }

      if (data.type === "NOTIFICATION_CREATED") {
        setNotifications((current) => [
          data.notification,
          ...current,
        ]);
      }

      if (data.type === "UNREAD_COUNT_UPDATED") {
        setUnreadCount(data.count);
      }

      if (data.type === "USER_ONLINE") {
        setOnlineUsers((current) => {
          const exists = current.some(
            (onlineUser) =>
              onlineUser.id === data.user.id
          );

          if (exists) {
            return current;
          }

          return [...current, data.user];
        });
      }

      if (data.type === "USER_OFFLINE") {
        setOnlineUsers((current) =>
          current.filter(
            (onlineUser) =>
              onlineUser.id !== data.user.id
          )
        );
      }
    },
    []
  );

  useWebSocket({
    accessToken,
    onMessage: handleWebSocketMessage,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          tasksData,
          activitiesData,
          notificationsData,
          unreadData,
        ] = await Promise.all([
          getTasks(),
          getActivities(),
          getNotifications(),
          getUnreadNotificationCount(),
        ]);

        setTasks(tasksData);
        setActivities(activitiesData);
        setNotifications(notificationsData);
        setUnreadCount(unreadData);

        if (
          user?.role === "ADMIN" ||
          user?.role === "PROJECT_MANAGER"
        ) {
          const [
            projectsData,
            clientsData,
            developersData,
          ] = await Promise.all([
            getProjects(),
            getClients(),
            getDevelopers(),
          ]);

          setProjects(projectsData);
          setClients(clientsData);
          setDevelopers(developersData);
        }
      } catch (error: any) {
        setError(
          error?.response?.data?.error ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [user]);

  const handleCreateProject = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!projectName.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!projectClientId) {
      setError("Please select a client.");
      return;
    }

    if (!user) {
      setError("Authentication required.");
      return;
    }

    try {
      setCreatingProject(true);
      setError("");

      const newProject = await createProject({
        name: projectName.trim(),
        description:
          projectDescription.trim() || undefined,
        clientId: projectClientId,
        managerId: user.id,
      });

      setProjects((current) => [
        newProject,
        ...current,
      ]);

      setProjectName("");
      setProjectDescription("");
      setProjectClientId("");
      setShowCreateProject(false);
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          "Failed to create project."
      );
    } finally {
      setCreatingProject(false);
    }
  };

  const startEditingProject = (
    project: Project
  ) => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
    setEditingProjectDescription(
      project.description || ""
    );
    setEditingProjectClientId(
      project.client?.id || ""
    );
    setError("");
  };

  const cancelEditingProject = () => {
    setEditingProjectId(null);
    setEditingProjectName("");
    setEditingProjectDescription("");
    setEditingProjectClientId("");
  };

  const handleUpdateProject = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!editingProjectId) {
      return;
    }

    if (!editingProjectName.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!editingProjectClientId) {
      setError("Please select a client.");
      return;
    }

    try {
      setUpdatingProjectId(editingProjectId);
      setError("");

      const updatedProject = await updateProject(
        editingProjectId,
        {
          name: editingProjectName.trim(),
          description:
            editingProjectDescription.trim() ||
            undefined,
          clientId: editingProjectClientId,
        }
      );

      setProjects((current) =>
        current.map((project) =>
          project.id === editingProjectId
            ? updatedProject
            : project
        )
      );

      cancelEditingProject();
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          "Failed to update project."
      );
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const handleDeleteProject = async (
    projectId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProjectId(projectId);
      setError("");

      await deleteProject(projectId);

      setProjects((current) =>
        current.filter(
          (project) => project.id !== projectId
        )
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          "Failed to delete project."
      );
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleCreateTask = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!taskTitle.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!taskProjectId) {
      setError("Please select a project.");
      return;
    }

    if (!taskDeveloperId) {
      setError("Please select a developer.");
      return;
    }

    if (!taskDueDate) {
      setError("Please select a due date.");
      return;
    }

    try {
      setCreatingTask(true);
      setError("");

      const newTask = await createTask({
        title: taskTitle.trim(),
        description:
          taskDescription.trim() || undefined,
        projectId: taskProjectId,
        developerId: taskDeveloperId,
        priority: taskPriority,
        dueDate: new Date(
          taskDueDate
        ).toISOString(),
      });

      setTasks((current) => [
        newTask,
        ...current,
      ]);

      setTaskTitle("");
      setTaskDescription("");
      setTaskProjectId("");
      setTaskDeveloperId("");
      setTaskPriority("MEDIUM");
      setTaskDueDate("");
      setShowCreateTask(false);
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          "Failed to create task."
      );
    } finally {
      setCreatingTask(false);
    }
  };

  const startEditingTask = (task: any) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setEditingTaskDescription(
      task.description || ""
    );
    setEditingTaskProjectId(task.projectId);
    setEditingTaskDeveloperId(task.developerId);
    setEditingTaskPriority(
      task.priority || "MEDIUM"
    );

    if (task.dueDate) {
      const date = new Date(task.dueDate);

      const localDate = new Date(
        date.getTime() -
          date.getTimezoneOffset() * 60000
      );

      setEditingTaskDueDate(
        localDate.toISOString().slice(0, 16)
      );
    } else {
      setEditingTaskDueDate("");
    }

    setError("");
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
    setEditingTaskDescription("");
    setEditingTaskProjectId("");
    setEditingTaskDeveloperId("");
    setEditingTaskPriority("MEDIUM");
    setEditingTaskDueDate("");
  };

  const handleUpdateTask = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!editingTaskId) {
      return;
    }

    if (!editingTaskTitle.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!editingTaskProjectId) {
      setError("Please select a project.");
      return;
    }

    if (!editingTaskDeveloperId) {
      setError("Please select a developer.");
      return;
    }

    if (!editingTaskDueDate) {
      setError("Please select a due date.");
      return;
    }

    try {
      setUpdatingTaskDetailsId(editingTaskId);
      setError("");

      const updatedTask = await updateTask(
        editingTaskId,
        {
          title: editingTaskTitle.trim(),
          description:
            editingTaskDescription.trim() ||
            undefined,
          developerId: editingTaskDeveloperId,
          priority: editingTaskPriority,
          dueDate: new Date(
            editingTaskDueDate
          ).toISOString(),
        }
      );

      setTasks((current) =>
        current.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                ...updatedTask,
              }
            : task
        )
      );

      cancelEditingTask();
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          "Failed to update task."
      );
    } finally {
      setUpdatingTaskDetailsId(null);
    }
  };

  const handleDeleteTask = async (
    taskId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTaskId(taskId);
      setError("");

      await deleteTask(taskId);

      setTasks((current) =>
        current.filter(
          (task) => task.id !== taskId
        )
      );

      if (editingTaskId === taskId) {
        cancelEditingTask();
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          "Failed to delete task."
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleTaskStatusChange = async (
    taskId: string,
    status: string
  ) => {
    try {
      setError("");
      setUpdatingTaskId(taskId);

      const updatedTask = await updateTaskStatus(
        taskId,
        status
      );

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: updatedTask.status,
              }
            : task
        )
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          "Failed to update task status."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleMarkAsRead = async (
    notificationId: string
  ) => {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((current) =>
        current > 0 ? current - 1 : 0
      );
    } catch {
      setError(
        "Failed to mark notification as read."
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch {
      setError(
        "Failed to mark all notifications as read."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
      }}
    >
      <Navbar />

      <main
        style={{
          padding: "24px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ marginTop: 0 }}>
            Welcome, {user?.name}
          </h1>

          <p style={{ color: "#666" }}>
            Role: <strong>{user?.role}</strong>
          </p>

          <p
            style={{
              color: "#16a34a",
              fontWeight: 600,
            }}
          >
            ● Real-time connection enabled
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
            }}
          >
            Loading dashboard...
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              {(user?.role === "ADMIN" ||
                user?.role === "PROJECT_MANAGER") && (
                <StatCard
                  title="Projects"
                  value={projects.length}
                />
              )}

              <StatCard
                title="Tasks"
                value={tasks.length}
              />

              <StatCard
                title="Activities"
                value={activities.length}
              />

              <StatCard
                title="Notifications"
                value={notifications.length}
              />

              <StatCard
                title="Unread"
                value={unreadCount}
              />

              <StatCard
                title="Online Users"
                value={onlineUsers.length}
              />
            </div>

            {(user?.role === "ADMIN" ||
              user?.role === "PROJECT_MANAGER") && (
              <>
                <section
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <h2 style={{ margin: 0 }}>
                      Projects
                    </h2>

                    <button
                      onClick={() =>
                        setShowCreateProject(
                          (current) => !current
                        )
                      }
                      style={primaryButtonStyle}
                    >
                      {showCreateProject
                        ? "Cancel"
                        : "+ Create Project"}
                    </button>
                  </div>

                  {showCreateProject && (
                    <form
                      onSubmit={
                        handleCreateProject
                      }
                      style={formStyle}
                    >
                      <h3 style={{ marginTop: 0 }}>
                        Create New Project
                      </h3>

                      <input
                        type="text"
                        placeholder="Project name"
                        value={projectName}
                        onChange={(event) =>
                          setProjectName(
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      />

                      <textarea
                        placeholder="Project description"
                        value={
                          projectDescription
                        }
                        onChange={(event) =>
                          setProjectDescription(
                            event.target.value
                          )
                        }
                        rows={3}
                        style={inputStyle}
                      />

                      <select
                        value={projectClientId}
                        onChange={(event) =>
                          setProjectClientId(
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      >
                        <option value="">
                          Select client
                        </option>

                        {clients.map((client) => (
                          <option
                            key={client.id}
                            value={client.id}
                          >
                            {client.company} —{" "}
                            {client.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        disabled={creatingProject}
                        style={successButtonStyle}
                      >
                        {creatingProject
                          ? "Creating..."
                          : "Create Project"}
                      </button>
                    </form>
                  )}

                  {projects.length === 0 ? (
                    <p>No projects found.</p>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          style={cardStyle}
                        >
                          {editingProjectId ===
                          project.id ? (
                            <form
                              onSubmit={
                                handleUpdateProject
                              }
                            >
                              <h3
                                style={{
                                  marginTop: 0,
                                }}
                              >
                                Edit Project
                              </h3>

                              <input
                                type="text"
                                value={
                                  editingProjectName
                                }
                                onChange={(event) =>
                                  setEditingProjectName(
                                    event.target
                                      .value
                                  )
                                }
                                style={inputStyle}
                              />

                              <textarea
                                value={
                                  editingProjectDescription
                                }
                                onChange={(event) =>
                                  setEditingProjectDescription(
                                    event.target
                                      .value
                                  )
                                }
                                rows={3}
                                style={inputStyle}
                              />

                              <select
                                value={
                                  editingProjectClientId
                                }
                                onChange={(event) =>
                                  setEditingProjectClientId(
                                    event.target
                                      .value
                                  )
                                }
                                style={inputStyle}
                              >
                                <option value="">
                                  Select client
                                </option>

                                {clients.map(
                                  (client) => (
                                    <option
                                      key={
                                        client.id
                                      }
                                      value={
                                        client.id
                                      }
                                    >
                                      {
                                        client.company
                                      }{" "}
                                      —{" "}
                                      {client.name}
                                    </option>
                                  )
                                )}
                              </select>

                              <button
                                type="submit"
                                disabled={
                                  updatingProjectId ===
                                  project.id
                                }
                                style={{
                                  ...successButtonStyle,
                                  marginRight:
                                    "8px",
                                }}
                              >
                                {updatingProjectId ===
                                project.id
                                  ? "Saving..."
                                  : "Save"}
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEditingProject
                                }
                                style={
                                  secondaryButtonStyle
                                }
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <>
                              <h3
                                style={{
                                  marginTop: 0,
                                }}
                              >
                                {project.name}
                              </h3>

                              <p
                                style={{
                                  color: "#666",
                                }}
                              >
                                {project.description ||
                                  "No description"}
                              </p>

                              <p>
                                <strong>
                                  Client:
                                </strong>{" "}
                                {project.client
                                  ?.company ||
                                  project.client
                                    ?.name ||
                                  "N/A"}
                              </p>

                              <p>
                                <strong>
                                  Manager:
                                </strong>{" "}
                                {project.manager
                                  ?.name ||
                                  "N/A"}
                              </p>

                              <p>
                                <strong>
                                  Tasks:
                                </strong>{" "}
                                {project.tasks
                                  ?.length || 0}
                              </p>

                              <div
                                style={{
                                  marginTop:
                                    "14px",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    startEditingProject(
                                      project
                                    )
                                  }
                                  style={{
                                    ...secondaryButtonStyle,
                                    marginRight:
                                      "8px",
                                  }}
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeleteProject(
                                      project.id
                                    )
                                  }
                                  disabled={
                                    deletingProjectId ===
                                    project.id
                                  }
                                  style={
                                    dangerButtonStyle
                                  }
                                >
                                  {deletingProjectId ===
                                  project.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <h2 style={{ margin: 0 }}>
                      Task Management
                    </h2>

                    <button
                      onClick={() =>
                        setShowCreateTask(
                          (current) => !current
                        )
                      }
                      style={primaryButtonStyle}
                    >
                      {showCreateTask
                        ? "Cancel"
                        : "+ Create Task"}
                    </button>
                  </div>

                  {showCreateTask && (
                    <form
                      onSubmit={handleCreateTask}
                      style={formStyle}
                    >
                      <h3 style={{ marginTop: 0 }}>
                        Create New Task
                      </h3>

                      <input
                        type="text"
                        placeholder="Task title"
                        value={taskTitle}
                        onChange={(event) =>
                          setTaskTitle(
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      />

                      <textarea
                        placeholder="Task description"
                        value={
                          taskDescription
                        }
                        onChange={(event) =>
                          setTaskDescription(
                            event.target.value
                          )
                        }
                        rows={3}
                        style={inputStyle}
                      />

                      <select
                        value={taskProjectId}
                        onChange={(event) =>
                          setTaskProjectId(
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      >
                        <option value="">
                          Select project
                        </option>

                        {projects.map((project) => (
                          <option
                            key={project.id}
                            value={project.id}
                          >
                            {project.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={taskDeveloperId}
                        onChange={(event) =>
                          setTaskDeveloperId(
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      >
                        <option value="">
                          Select developer
                        </option>

                        {developers.map(
                          (developer) => (
                            <option
                              key={developer.id}
                              value={developer.id}
                            >
                              {developer.name} —{" "}
                              {developer.email}
                            </option>
                          )
                        )}
                      </select>

                      <select
                        value={taskPriority}
                        onChange={(event) =>
                          setTaskPriority(
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      >
                        <option value="LOW">
                          LOW
                        </option>

                        <option value="MEDIUM">
                          MEDIUM
                        </option>

                        <option value="HIGH">
                          HIGH
                        </option>

                        <option value="CRITICAL">
                          CRITICAL
                        </option>
                      </select>

                      <input
                        type="datetime-local"
                        value={taskDueDate}
                        onChange={(event) =>
                          setTaskDueDate(
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      />

                      <button
                        type="submit"
                        disabled={creatingTask}
                        style={successButtonStyle}
                      >
                        {creatingTask
                          ? "Creating..."
                          : "Create Task"}
                      </button>
                    </form>
                  )}
                </section>
              </>
            )}

            <section
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <h2>Recent Tasks</h2>

              {tasks.length === 0 ? (
                <p>No tasks found.</p>
              ) : (
                tasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: "14px 0",
                      borderBottom:
                        "1px solid #eee",
                    }}
                  >
                    {editingTaskId === task.id &&
                    (user?.role === "ADMIN" ||
                      user?.role ===
                        "PROJECT_MANAGER") ? (
                      <form
                        onSubmit={handleUpdateTask}
                        style={{
                          border:
                            "1px solid #e5e7eb",
                          borderRadius: "10px",
                          padding: "16px",
                        }}
                      >
                        <h3
                          style={{
                            marginTop: 0,
                          }}
                        >
                          Edit Task
                        </h3>

                        <input
                          type="text"
                          value={editingTaskTitle}
                          onChange={(event) =>
                            setEditingTaskTitle(
                              event.target.value
                            )
                          }
                          placeholder="Task title"
                          style={inputStyle}
                        />

                        <textarea
                          value={
                            editingTaskDescription
                          }
                          onChange={(event) =>
                            setEditingTaskDescription(
                              event.target.value
                            )
                          }
                          placeholder="Task description"
                          rows={3}
                          style={inputStyle}
                        />

                        <select
                          value={
                            editingTaskProjectId
                          }
                          onChange={(event) =>
                            setEditingTaskProjectId(
                              event.target.value
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="">
                            Select project
                          </option>

                          {projects.map((project) => (
                            <option
                              key={project.id}
                              value={project.id}
                            >
                              {project.name}
                            </option>
                          ))}
                        </select>

                        <select
                          value={
                            editingTaskDeveloperId
                          }
                          onChange={(event) =>
                            setEditingTaskDeveloperId(
                              event.target.value
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="">
                            Select developer
                          </option>

                          {developers.map(
                            (developer) => (
                              <option
                                key={
                                  developer.id
                                }
                                value={
                                  developer.id
                                }
                              >
                                {developer.name} —{" "}
                                {developer.email}
                              </option>
                            )
                          )}
                        </select>

                        <select
                          value={
                            editingTaskPriority
                          }
                          onChange={(event) =>
                            setEditingTaskPriority(
                              event.target.value
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="LOW">
                            LOW
                          </option>

                          <option value="MEDIUM">
                            MEDIUM
                          </option>

                          <option value="HIGH">
                            HIGH
                          </option>

                          <option value="CRITICAL">
                            CRITICAL
                          </option>
                        </select>

                        <input
                          type="datetime-local"
                          value={
                            editingTaskDueDate
                          }
                          onChange={(event) =>
                            setEditingTaskDueDate(
                              event.target.value
                            )
                          }
                          style={inputStyle}
                        />

                        <button
                          type="submit"
                          disabled={
                            updatingTaskDetailsId ===
                            task.id
                          }
                          style={{
                            ...successButtonStyle,
                            marginRight: "8px",
                          }}
                        >
                          {updatingTaskDetailsId ===
                          task.id
                            ? "Saving..."
                            : "Save"}
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelEditingTask
                          }
                          style={
                            secondaryButtonStyle
                          }
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <strong>{task.title}</strong>

                        <div
                          style={{
                            color: "#666",
                            fontSize: "14px",
                            marginTop: "4px",
                          }}
                        >
                          Priority:{" "}
                          {task.priority}
                        </div>

                        <div
                          style={{
                            color: "#666",
                            fontSize: "14px",
                            marginTop: "4px",
                          }}
                        >
                          Status: {task.status}
                        </div>

                        {task.developer && (
                          <div
                            style={{
                              color: "#666",
                              fontSize: "14px",
                              marginTop: "4px",
                            }}
                          >
                            Developer:{" "}
                            {task.developer.name}
                          </div>
                        )}

                        {task.dueDate && (
                          <div
                            style={{
                              color: "#666",
                              fontSize: "14px",
                              marginTop: "4px",
                            }}
                          >
                            Due:{" "}
                            {new Date(
                              task.dueDate
                            ).toLocaleString()}
                          </div>
                        )}

                        <select
                          value={task.status}
                          disabled={
                            updatingTaskId ===
                            task.id
                          }
                          onChange={(event) =>
                            handleTaskStatusChange(
                              task.id,
                              event.target.value
                            )
                          }
                          style={{
                            marginTop: "8px",
                            padding: "7px",
                            borderRadius: "6px",
                            border:
                              "1px solid #ccc",
                          }}
                        >
                          <option value="TODO">
                            TODO
                          </option>

                          <option value="IN_PROGRESS">
                            IN_PROGRESS
                          </option>

                          <option value="IN_REVIEW">
                            IN_REVIEW
                          </option>

                          <option value="DONE">
                            DONE
                          </option>
                        </select>

                        {updatingTaskId ===
                          task.id && (
                          <small
                            style={{
                              marginLeft: "8px",
                              color: "#666",
                            }}
                          >
                            Updating...
                          </small>
                        )}

                        {(user?.role === "ADMIN" ||
                          user?.role ===
                            "PROJECT_MANAGER") && (
                          <div
                            style={{
                              marginTop: "10px",
                            }}
                          >
                            <button
                              onClick={() =>
                                startEditingTask(
                                  task
                                )
                              }
                              style={{
                                ...secondaryButtonStyle,
                                marginRight:
                                  "8px",
                              }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteTask(
                                  task.id
                                )
                              }
                              disabled={
                                deletingTaskId ===
                                task.id
                              }
                              style={
                                dangerButtonStyle
                              }
                            >
                              {deletingTaskId ===
                              task.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </section>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              <section style={sectionStyle}>
                <h2>Live Activity Feed</h2>

                {activities.length === 0 ? (
                  <p>No activity found.</p>
                ) : (
                  activities
                    .slice(0, 10)
                    .map((activity) => (
                      <div
                        key={activity.id}
                        style={{
                          padding: "10px 0",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        <strong>
                          {activity.task?.title ||
                            "Task"}
                        </strong>

                        <div
                          style={{
                            color: "#666",
                            fontSize: "14px",
                          }}
                        >
                          {activity.oldStatus} →{" "}
                          {activity.newStatus}
                        </div>

                        <small
                          style={{
                            color: "#999",
                          }}
                        >
                          {activity.user?.name}
                        </small>
                      </div>
                    ))
                )}
              </section>

              <section style={sectionStyle}>
                <h2>Online Users</h2>

                {onlineUsers.length === 0 ? (
                  <p>
                    No other users currently online.
                  </p>
                ) : (
                  onlineUsers.map((onlineUser) => (
                    <div
                      key={onlineUser.id}
                      style={{
                        padding: "10px 0",
                        borderBottom:
                          "1px solid #eee",
                      }}
                    >
                      <strong>
                        ● {onlineUser.name}
                      </strong>

                      <div
                        style={{
                          color: "#666",
                          fontSize: "14px",
                        }}
                      >
                        {onlineUser.role}
                      </div>
                    </div>
                  ))
                )}
              </section>

              <section style={sectionStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: "10px",
                  }}
                >
                  <h2>
                    Notifications
                    {unreadCount > 0 &&
                      ` (${unreadCount} unread)`}
                  </h2>

                  {unreadCount > 0 && (
                    <button
                      onClick={
                        handleMarkAllAsRead
                      }
                      style={primaryButtonStyle}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p>No notifications.</p>
                ) : (
                  notifications
                    .slice(0, 10)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        style={{
                          padding: "10px 0",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        <strong>
                          {notification.type}
                        </strong>

                        <div
                          style={{
                            color: "#666",
                            fontSize: "14px",
                            marginTop: "4px",
                          }}
                        >
                          {notification.message}
                        </div>

                        {!notification.isRead ? (
                          <button
                            onClick={() =>
                              handleMarkAsRead(
                                notification.id
                              )
                            }
                            style={{
                              ...secondaryButtonStyle,
                              marginTop: "8px",
                            }}
                          >
                            Mark as read
                          </button>
                        ) : (
                          <small
                            style={{
                              color:
                                "#16a34a",
                            }}
                          >
                            Read
                          </small>
                        )}
                      </div>
                    ))
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const sectionStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
};

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "16px",
};

const formStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "16px",
  marginBottom: "20px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const primaryButtonStyle = {
  padding: "9px 14px",
  border: "none",
  borderRadius: "7px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const successButtonStyle = {
  padding: "9px 14px",
  border: "none",
  borderRadius: "7px",
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  padding: "7px 11px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "white",
  cursor: "pointer",
};

const dangerButtonStyle = {
  padding: "7px 11px",
  border: "none",
  borderRadius: "6px",
  background: "#dc2626",
  color: "white",
  cursor: "pointer",
};

interface StatCardProps {
  title: string;
  value: number;
}

const StatCard = ({
  title,
  value,
}: StatCardProps) => {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
      }}
    >
      <div
        style={{
          color: "#666",
          fontSize: "14px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          marginTop: "8px",
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default Dashboard;