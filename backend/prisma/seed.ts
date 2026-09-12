import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting database seed...");

  // Clean previous seed-generated data.
  // This prevents duplicate tasks and activity logs
  // when the seed is run multiple times.
  await prisma.activityLog.deleteMany({
    where: {
      task: {
        project: {
          id: {
            in: [
              "seed-project-1",
              "seed-project-2",
              "seed-project-3",
            ],
          },
        },
      },
    },
  });

  await prisma.notification.deleteMany({
    where: {
      user: {
        email: {
          endsWith: "@velozity.com",
        },
      },
    },
  });

  await prisma.task.deleteMany({
    where: {
      projectId: {
        in: [
          "seed-project-1",
          "seed-project-2",
          "seed-project-3",
        ],
      },
    },
  });

  await prisma.project.deleteMany({
    where: {
      id: {
        in: [
          "seed-project-1",
          "seed-project-2",
          "seed-project-3",
        ],
      },
    },
  });

  const password = await bcrypt.hash(
    "Password123!",
    12
  );

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@velozity.com",
    },
    update: {
      role: Role.ADMIN,
      password,
    },
    create: {
      name: "Admin User",
      email: "admin@velozity.com",
      password,
      role: Role.ADMIN,
    },
  });

  const manager1 = await prisma.user.upsert({
    where: {
      email: "manager1@velozity.com",
    },
    update: {
      role: Role.PROJECT_MANAGER,
      password,
    },
    create: {
      name: "Project Manager One",
      email: "manager1@velozity.com",
      password,
      role: Role.PROJECT_MANAGER,
    },
  });

  const manager2 = await prisma.user.upsert({
    where: {
      email: "manager2@velozity.com",
    },
    update: {
      role: Role.PROJECT_MANAGER,
      password,
    },
    create: {
      name: "Project Manager Two",
      email: "manager2@velozity.com",
      password,
      role: Role.PROJECT_MANAGER,
    },
  });

  const developers = await Promise.all(
    Array.from({ length: 4 }, (_, index) => {
      const number = index + 1;

      return prisma.user.upsert({
        where: {
          email: `developer${number}@velozity.com`,
        },
        update: {
          role: Role.DEVELOPER,
          password,
        },
        create: {
          name: `Developer ${number}`,
          email: `developer${number}@velozity.com`,
          password,
          role: Role.DEVELOPER,
        },
      });
    })
  );

  const client1 = await prisma.client.upsert({
    where: {
      email: "client1@example.com",
    },
    update: {},
    create: {
      name: "Acme Client",
      email: "client1@example.com",
      company: "Acme Corporation",
    },
  });

  const client2 = await prisma.client.upsert({
    where: {
      email: "globex@example.com",
    },
    update: {},
    create: {
      name: "Globex Client",
      email: "globex@example.com",
      company: "Globex Corporation",
    },
  });

  const client3 = await prisma.client.upsert({
    where: {
      email: "initech@example.com",
    },
    update: {},
    create: {
      name: "Initech Client",
      email: "initech@example.com",
      company: "Initech",
    },
  });

  const project1 = await prisma.project.create({
    data: {
      id: "seed-project-1",
      name: "E-Commerce Platform",
      description:
        "Development of a modern e-commerce platform.",
      clientId: client1.id,
      managerId: manager1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      id: "seed-project-2",
      name: "Banking Dashboard",
      description:
        "Real-time banking analytics dashboard.",
      clientId: client2.id,
      managerId: manager1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      id: "seed-project-3",
      name: "Healthcare Management System",
      description:
        "Healthcare project and patient management platform.",
      clientId: client3.id,
      managerId: manager2.id,
    },
  });

  const projects = [
    project1,
    project2,
    project3,
  ];

  const taskDefinitions = [
    {
      title: "Design project architecture",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      daysFromNow: 5,
      developerId: developers[0].id,
    },
    {
      title: "Build authentication module",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      daysFromNow: 7,
      developerId: developers[1].id,
    },
    {
      title: "Create database schema",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      daysFromNow: 3,
      developerId: developers[2].id,
    },
    {
      title: "Implement product API",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      daysFromNow: 10,
      developerId: developers[3].id,
    },
    {
      title: "Write API documentation",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      daysFromNow: 14,
      developerId: developers[0].id,
    },
  ];

  const createdTasks = [];

  for (const project of projects) {
    for (const task of taskDefinitions) {
      const dueDate = new Date();

      dueDate.setDate(
        dueDate.getDate() + task.daysFromNow
      );

      const createdTask = await prisma.task.create({
        data: {
          title: task.title,
          description: `Task for ${project.name}`,
          projectId: project.id,
          developerId: task.developerId,
          status: task.status,
          priority: task.priority,
          dueDate,
          isOverdue: false,
        },
      });

      createdTasks.push(createdTask);
    }
  }

  const overdueTask1 = await prisma.task.create({
    data: {
      title: "Fix payment integration",
      description:
        "Resolve payment gateway integration issues.",
      projectId: project1.id,
      developerId: developers[1].id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: new Date(
        Date.now() -
          3 * 24 * 60 * 60 * 1000
      ),
      isOverdue: true,
    },
  });

  const overdueTask2 = await prisma.task.create({
    data: {
      title: "Resolve dashboard bugs",
      description:
        "Fix outstanding dashboard bugs.",
      projectId: project2.id,
      developerId: developers[2].id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: new Date(
        Date.now() -
          2 * 24 * 60 * 60 * 1000
      ),
      isOverdue: true,
    },
  });

  createdTasks.push(overdueTask1);
  createdTasks.push(overdueTask2);

  await prisma.activityLog.createMany({
    data: [
      {
        taskId: createdTasks[0].id,
        userId: developers[0].id,
        oldStatus: TaskStatus.TODO,
        newStatus: TaskStatus.IN_PROGRESS,
      },
      {
        taskId: createdTasks[0].id,
        userId: developers[0].id,
        oldStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.DONE,
      },
      {
        taskId: createdTasks[1].id,
        userId: developers[1].id,
        oldStatus: TaskStatus.TODO,
        newStatus: TaskStatus.IN_PROGRESS,
      },
      {
        taskId: createdTasks[3].id,
        userId: developers[3].id,
        oldStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.IN_REVIEW,
      },
      {
        taskId: createdTasks[5].id,
        userId: developers[0].id,
        oldStatus: TaskStatus.TODO,
        newStatus: TaskStatus.IN_PROGRESS,
      },
      {
        taskId: createdTasks[6].id,
        userId: developers[1].id,
        oldStatus: TaskStatus.TODO,
        newStatus: TaskStatus.DONE,
      },
    ],
  });

  console.log(`Admin: ${admin.email}`);
  console.log(
    `Project Managers: ${manager1.email}, ${manager2.email}`
  );
  console.log(`Developers: ${developers.length}`);
  console.log(`Projects: ${projects.length}`);
  console.log(`Tasks: ${createdTasks.length}`);
  console.log("Activity logs: 6");
  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });