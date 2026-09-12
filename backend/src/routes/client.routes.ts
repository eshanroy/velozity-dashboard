import { Router } from "express";
import {
  createClient,
  getClients,
} from "../controllers/client.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validation.middleware";
import { createClientSchema } from "../validation/client.validation";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.PROJECT_MANAGER),
  getClients
);

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(createClientSchema),
  createClient
);

export default router;