import { Router } from "express";

import {
  createTaskController,
  getTasksController,
  updateTaskStatusController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/task.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validation.middleware";

import {
  createTaskSchema,
  updateTaskStatusSchema,
  updateTaskSchema,
} from "../validation/task.validation";

import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.PROJECT_MANAGER,
    Role.DEVELOPER
  ),
  getTasksController
);

router.post(
  "/",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.PROJECT_MANAGER
  ),
  validate(createTaskSchema),
  createTaskController
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.PROJECT_MANAGER,
    Role.DEVELOPER
  ),
  validate(updateTaskStatusSchema),
  updateTaskStatusController
);

router.patch(
  "/:id",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.PROJECT_MANAGER,
    Role.DEVELOPER
  ),
  validate(updateTaskSchema),
  updateTaskController
);

router.delete(
  "/:id",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.PROJECT_MANAGER,
    Role.DEVELOPER
  ),
  deleteTaskController
);

export default router;