import { Router } from "express";

import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "../controllers/notification.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getNotificationsController
);

router.get(
  "/unread-count",
  authenticate,
  getUnreadNotificationCountController
);

router.patch(
  "/:id/read",
  authenticate,
  markNotificationAsReadController
);

router.patch(
  "/read-all",
  authenticate,
  markAllNotificationsAsReadController
);

export default router;