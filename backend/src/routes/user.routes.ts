import { Router } from "express";

import {
  getCurrentUser,
  getDevelopers,
} from "../controllers/user.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/me",
  authenticate,
  getCurrentUser
);

router.get(
  "/developers",
  authenticate,
  authorize(
    Role.ADMIN,
    Role.PROJECT_MANAGER
  ),
  getDevelopers
);

export default router;