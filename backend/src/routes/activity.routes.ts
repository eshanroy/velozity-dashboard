import { Router } from "express";
import { getActivityLogs } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.PROJECT_MANAGER, Role.DEVELOPER),
  getActivityLogs
);

export default router;