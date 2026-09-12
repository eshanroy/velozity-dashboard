import { Router } from "express";
import {
  register,
  login,
  logout,
} from "../controllers/auth.controller";
import { refreshAccessToken } from "../controllers/refresh.controller";
import { validate } from "../middleware/validation.middleware";
import {
  registerSchema,
  loginSchema,
} from "../validation/auth.validation";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.post("/refresh", refreshAccessToken);

router.post("/logout", logout);

export default router;