import { Router } from "express";
import { z } from "zod";
import {
  canViewContent,
  getStore,
  nextId,
  serializeReel
} from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";
import { buildPublicFileUrl, publicMediaUpload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";

const createReelSchema = z.object({
  title: z.string().trim().max(120).optional(),
  caption: z.string().trim().max(2200).optional(),
  audioName: z.string().trim().max(150).optional(),
  location: z.string().trim().max(150).optional(),
  videoUrl: z.string().trim().optional(),
  coverImage: z.string().trim().optional(),
  durationSeconds: z.coerce.number().min(0).max(180).optional(),
  visibility: z.enum(["public", "followers", "private"]).default("public")
});

export const reelRouter = Router();

reelRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const viewerId = request.user?.id;
    response.json({
      success: true,
      reels: getStore().reels
        .filter((reel) => canViewContent(reel.userId, reel.visibility, viewerId))
        .map((reel) => serializeReel(reel, viewerId))
    });
  })
);

reelRouter.post(
  "/",
  requireAuth,
  publicMediaUpload.single("file"),
  asyncHandler(async (request, response) => {
    const payload = createReelSchema.parse(request.body);
    const store = getStore();
    const videoUrl = buildPublicFileUrl(request.file) ?? payload.videoUrl;

    if (!videoUrl) {
      throw new AppError("A reel video file or video URL is required.", 400);
    }

    const reel = {
      id: nextId(store.reels),
      userId: request.user!.id,
      title: payload.title ?? null,
      caption: payload.caption ?? null,
      videoUrl,
      coverImage: payload.coverImage ?? null,
      audioName: payload.audioName ?? null,
      location: payload.location ?? null,
      durationSeconds: payload.durationSeconds ?? null,
      visibility: payload.visibility,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.reels.unshift(reel);

    response.status(201).json({
      success: true,
      message: "Uploaded successfully.",
      reel: serializeReel(reel, request.user!.id)
    });
  })
);

reelRouter.put(
  "/:id",
  requireAuth,
  publicMediaUpload.single("file"),
  asyncHandler(async (request, response) => {
    const payload = createReelSchema.parse(request.body);
    const store = getStore();
    const reel = store.reels.find((entry) => entry.id === Number(request.params.id));

    if (!reel) {
      throw new AppError("Reel not found.", 404);
    }
    if (reel.userId !== request.user!.id) {
      throw new AppError("You can only manage your own reel.", 403);
    }

    reel.title = payload.title ?? reel.title ?? null;
    reel.caption = payload.caption ?? reel.caption;
    reel.videoUrl = buildPublicFileUrl(request.file) ?? payload.videoUrl ?? reel.videoUrl;
    reel.coverImage = payload.coverImage ?? reel.coverImage;
    reel.audioName = payload.audioName ?? reel.audioName;
    reel.location = payload.location ?? reel.location;
    reel.durationSeconds = payload.durationSeconds ?? reel.durationSeconds ?? null;
    reel.visibility = payload.visibility ?? reel.visibility;
    reel.updatedAt = new Date().toISOString();

    response.json({
      success: true,
      message: "Updated successfully.",
      reel: serializeReel(reel, request.user!.id)
    });
  })
);

reelRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (request, response) => {
    const store = getStore();
    const reelId = Number(request.params.id);
    const reel = store.reels.find((entry) => entry.id === reelId);

    if (!reel) {
      throw new AppError("Reel not found.", 404);
    }
    if (reel.userId !== request.user!.id) {
      throw new AppError("You can only manage your own reel.", 403);
    }

    store.reels = store.reels.filter((entry) => entry.id !== reelId);

    response.json({
      success: true,
      message: "Deleted successfully."
    });
  })
);
