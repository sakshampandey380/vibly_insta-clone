import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getStore } from "../data/store.js";

export const notificationRouter = Router();

notificationRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (request, response) => {
    const notifications = getStore().notifications.filter(
      (notification) => notification.userId === request.user!.id
    );

    response.json({
      success: true,
      notifications
    });
  })
);

