import { Router } from "express";
import { z } from "zod";
import { buildPublicFileUrl, publicMediaUpload } from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import {
  canViewContent,
  getStore,
  nextId,
  serializePost
} from "../data/store.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";

const createPostSchema = z.object({
  title: z.string().trim().max(120).optional(),
  caption: z.string().trim().max(2200).optional(),
  location: z.string().trim().max(150).optional(),
  mediaType: z.enum(["image", "video"]).default("image"),
  mediaUrl: z.string().trim().optional(),
  thumbnailUrl: z.string().trim().optional(),
  visibility: z.enum(["public", "followers", "private"]).default("public")
});

const updatePostSchema = createPostSchema.extend({
  title: z.string().trim().max(120).optional(),
  caption: z.string().trim().max(2200).optional(),
  location: z.string().trim().max(150).optional()
});

const createCommentSchema = z.object({
  commentText: z.string().trim().min(1).max(500)
});

export const postRouter = Router();

postRouter.get(
  "/feed",
  asyncHandler(async (request, response) => {
    const store = getStore();
    const viewerId = request.headers.authorization ? request.user?.id : undefined;
    response.json({
      success: true,
      posts: store.posts
        .filter((post) => canViewContent(post.userId, post.visibility, viewerId))
        .map((post) => serializePost(post, viewerId))
    });
  })
);

postRouter.post(
  "/",
  requireAuth,
  publicMediaUpload.single("file"),
  asyncHandler(async (request, response) => {
    const payload = createPostSchema.parse(request.body);
    const store = getStore();
    const now = new Date().toISOString();
    const mediaUrl = buildPublicFileUrl(request.file) ?? payload.mediaUrl;

    if (!mediaUrl) {
      throw new AppError("A media file or media URL is required.", 400);
    }

    const post = {
      id: nextId(store.posts),
      userId: request.user!.id,
      title: payload.title ?? null,
      caption: payload.caption ?? null,
      location: payload.location ?? null,
      mediaUrl,
      mediaType: payload.mediaType,
      thumbnailUrl: payload.thumbnailUrl ?? null,
      visibility: payload.visibility,
      createdAt: now,
      updatedAt: now
    };

    store.posts.unshift(post);

    response.status(201).json({
      success: true,
      message: "Uploaded successfully.",
      post: serializePost(post, request.user!.id)
    });
  })
);

postRouter.get(
  "/:id",
  asyncHandler(async (request, response) => {
    const post = getStore().posts.find((entry) => entry.id === Number(request.params.id));

    if (!post) {
      throw new AppError("Post not found.", 404);
    }

    if (!canViewContent(post.userId, post.visibility, request.user?.id)) {
      throw new AppError("You do not have access to this post.", 403);
    }

    response.json({
      success: true,
      post: serializePost(post, request.user?.id)
    });
  })
);

postRouter.put(
  "/:id",
  requireAuth,
  publicMediaUpload.single("file"),
  asyncHandler(async (request, response) => {
    const payload = updatePostSchema.parse(request.body);
    const store = getStore();
    const post = store.posts.find((entry) => entry.id === Number(request.params.id));

    if (!post) {
      throw new AppError("Post not found.", 404);
    }

    if (post.userId !== request.user!.id) {
      throw new AppError("You can only manage your own post.", 403);
    }

    post.title = payload.title ?? post.title ?? null;
    post.caption = payload.caption ?? post.caption;
    post.location = payload.location ?? post.location;
    post.mediaType = payload.mediaType ?? post.mediaType;
    post.mediaUrl = buildPublicFileUrl(request.file) ?? payload.mediaUrl ?? post.mediaUrl;
    post.thumbnailUrl = payload.thumbnailUrl ?? post.thumbnailUrl ?? null;
    post.visibility = payload.visibility ?? post.visibility;
    post.updatedAt = new Date().toISOString();

    response.json({
      success: true,
      message: "Updated successfully.",
      post: serializePost(post, request.user!.id)
    });
  })
);

postRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (request, response) => {
    const store = getStore();
    const postId = Number(request.params.id);
    const post = store.posts.find((entry) => entry.id === postId);

    if (!post) {
      throw new AppError("Post not found.", 404);
    }
    if (post.userId !== request.user!.id) {
      throw new AppError("You can only manage your own post.", 403);
    }

    store.posts = store.posts.filter((entry) => entry.id !== postId);
    store.postLikes = store.postLikes.filter((entry) => entry.postId !== postId);
    store.postComments = store.postComments.filter((entry) => entry.postId !== postId);
    store.savedPosts = store.savedPosts.filter((entry) => entry.postId !== postId);

    response.json({
      success: true,
      message: "Deleted successfully."
    });
  })
);

postRouter.post(
  "/:id/like",
  requireAuth,
  asyncHandler(async (request, response) => {
    const store = getStore();
    const postId = Number(request.params.id);
    const post = store.posts.find((entry) => entry.id === postId);
    if (!post || !canViewContent(post.userId, post.visibility, request.user!.id)) {
      throw new AppError("Post not found.", 404);
    }

    const alreadyLiked = store.postLikes.some(
      (entry) => entry.postId === postId && entry.userId === request.user!.id
    );

    if (!alreadyLiked) {
      store.postLikes.push({
        id: nextId(store.postLikes),
        postId,
        userId: request.user!.id,
        createdAt: new Date().toISOString()
      });
    }

    response.json({
      success: true,
      message: "Updated successfully."
    });
  })
);

postRouter.delete(
  "/:id/like",
  requireAuth,
  asyncHandler(async (request, response) => {
    const store = getStore();
    const postId = Number(request.params.id);
    store.postLikes = store.postLikes.filter(
      (entry) => !(entry.postId === postId && entry.userId === request.user!.id)
    );

    response.json({
      success: true,
      message: "Updated successfully."
    });
  })
);

postRouter.post(
  "/:id/comment",
  requireAuth,
  asyncHandler(async (request, response) => {
    const payload = createCommentSchema.parse(request.body);
    const store = getStore();
    const postId = Number(request.params.id);
    const post = store.posts.find((entry) => entry.id === postId);
    if (!post || !canViewContent(post.userId, post.visibility, request.user!.id)) {
      throw new AppError("Post not found.", 404);
    }

    store.postComments.push({
      id: nextId(store.postComments),
      postId,
      userId: request.user!.id,
      commentText: payload.commentText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    response.status(201).json({
      success: true,
      message: "Updated successfully."
    });
  })
);

postRouter.post(
  "/:id/save",
  requireAuth,
  asyncHandler(async (request, response) => {
    const store = getStore();
    const postId = Number(request.params.id);
    const exists = store.savedPosts.some(
      (entry) => entry.postId === postId && entry.userId === request.user!.id
    );

    if (!exists) {
      store.savedPosts.push({
        id: nextId(store.savedPosts),
        userId: request.user!.id,
        postId,
        createdAt: new Date().toISOString()
      });
    }

    response.json({
      success: true,
      message: "Updated successfully."
    });
  })
);

postRouter.delete(
  "/:id/save",
  requireAuth,
  asyncHandler(async (request, response) => {
    const store = getStore();
    const postId = Number(request.params.id);
    store.savedPosts = store.savedPosts.filter(
      (entry) => !(entry.postId === postId && entry.userId === request.user!.id)
    );

    response.json({
      success: true,
      message: "Updated successfully."
    });
  })
);
