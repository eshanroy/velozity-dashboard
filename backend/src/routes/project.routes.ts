import { Router } from "express";

import {
  createProjectController,
  getProjectsController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/project.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validation.middleware";

import {
  createProjectSchema,
  updateProjectSchema,
} from "../validation/project.validation";

import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.PROJECT_MANAGER),
  getProjectsController
);

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(createProjectSchema),
  createProjectController
);

router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(updateProjectSchema),
  updateProjectController
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN, Role.PROJECT_MANAGER),
  deleteProjectController
);

export default router;