import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import {
  canViewUserProfile,
  getStore,
  isAcceptedFollower,
  isBlockedBetween,
  nextId,
  serializePost,
  serializeReel,
  serializeUserProfile
} from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";
import {
  buildPrivateFilePath,
  buildPublicFileUrl,
  imageUpload,
  privateDocumentUpload,
  privatePreferenceUpload
} from "../middleware/upload.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2),
  username: z.string().trim().min(3),
  phone: z.string().trim().min(6),
  bio: z.string().trim().max(255).optional(),
  website: z.string().trim().max(255).optional(),
  location: z.string().trim().max(150).optional()
});

const updateAccountSchema = z.object({
  username: z.string().trim().min(3),
  profileType: z.enum(["public", "private"])
});

const updatePreferencesSchema = z.object({
  hobbies: z.array(z.string()).default([]),
  favoriteNiche: z.string().trim().optional(),
  favoriteSports: z.array(z.string()).default([]),
  favoriteShows: z.array(z.string()).default([]),
  favoriteAnime: z.array(z.string()).default([]),
  education: z.string().trim().optional(),
  currentLocation: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  interestedIn: z.string().trim().optional(),
  socialLinks: z.record(z.string()).default({}),
  customLinks: z.array(z.object({ label: z.string(), url: z.string() })).default([])
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm password must match password.",
    path: ["confirmPassword"]
  });

const verificationSchema = z.object({
  documentType: z.enum(["school_id", "aadhaar_id"])
});

const nicknameSchema = z.object({
  nickname: z.string().trim().max(80)
});

const blockSchema = z.object({
  userId: z.number().int().positive(),
  reason: z.string().trim().max(255).optional()
});

const experienceSchema = z.object({
  appThemeId: z.string().trim().optional(),
  appThemeCustom: z.string().trim().optional(),
  chatThemeId: z.string().trim().optional(),
  chatThemeCustom: z.string().trim().optional(),
  notificationColor: z.string().trim().optional()
});

export const userRouter = Router();

userRouter.get(
  "/search",
  asyncHandler(async (request, response) => {
    const username = String(request.query.username ?? "").trim().toLowerCase();
    const store = getStore();
    const viewerId = request.user?.id;
    const results = store.users
      .filter((user) => user.username.toLowerCase().includes(username))
      .filter((user) => !isBlockedBetween(viewerId, user.id))
      .map((user) => serializeUserProfile(user));

    response.json({
      success: true,
      users: results
    });
  })
);

userRouter.get(
  "/connections/mutual",
  requireAuth,
  asyncHandler(async (request, response) => {
    const store = getStore();
    const viewerId = request.user!.id;
    const mutuals = store.users
      .filter((user) => user.id !== viewerId)
      .filter((user) => isAcceptedFollower(viewerId, user.id) && isAcceptedFollower(user.id, viewerId))
      .map((user) => ({
        ...serializeUserProfile(user),
        nickname:
          store.nicknames.find((entry) => entry.ownerId === viewerId && entry.targetUserId === user.id)?.nickname ?? ""
      }));

    response.json({
      success: true,
      users: mutuals
    });
  })
);

userRouter.put(
  "/connections/:userId/nickname",
  requireAuth,
  asyncHandler(async (request, response) => {
    const payload = nicknameSchema.parse(request.body);
    const store = getStore();
    const viewerId = request.user!.id;
    const targetUserId = Number(request.params.userId);

    if (!isAcceptedFollower(viewerId, targetUserId) || !isAcceptedFollower(targetUserId, viewerId)) {
      throw new AppError("Nicknames are only available for mutual connections.", 403);
    }

    const existing = store.nicknames.find(
      (entry) => entry.ownerId === viewerId && entry.targetUserId === targetUserId
    );
    const now = new Date().toISOString();

    if (existing) {
      existing.nickname = payload.nickname;
      existing.updatedAt = now;
    } else {
      store.nicknames.push({
        id: nextId(store.nicknames),
        ownerId: viewerId,
        targetUserId,
        nickname: payload.nickname,
        createdAt: now,
        updatedAt: now
      });
    }

    response.json({
      success: true,
      message: "Updated successfully."
    });
  })
);

userRouter.get(
  "/blocks",
  requireAuth,
  asyncHandler(async (request, response) => {
    const store = getStore();
    const entries = store.blocks
      .filter((entry) => entry.blockerId === request.user!.id)
      .map((entry) => ({
        ...entry,
        user: serializeUserProfile(store.users.find((user) => user.id === entry.blockedId)!)
      }));

    response.json({
      success: true,
      blockedUsers: entries
    });
  })
);

userRouter.post(
  "/blocks",
  requireAuth,
  asyncHandler(async (request, response) => {
    const payload = blockSchema.parse(request.body);
    const store = getStore();

    if (payload.userId === request.user!.id) {
      throw new AppError("You cannot block your own account.", 400);
    }

    const alreadyBlocked = store.blocks.some(
      (entry) => entry.blockerId === request.user!.id && entry.blockedId === payload.userId
    );
    if (!alreadyBlocked) {
      store.blocks.unshift({
        id: nextId(store.blocks),
        blockerId: request.user!.id,
        blockedId: payload.userId,
        reason: payload.reason ?? null,
        createdAt: new Date().toISOString()
      });
    }

    store.followers = store.followers.filter(
      (entry) =>
        !(
          (entry.followerId === request.user!.id && entry.followingId === payload.userId) ||
          (entry.followerId === payload.userId && entry.followingId === request.user!.id)
        )
    );

    store.conversations = store.conversations.filter(
      (conversation) =>
        !(conversation.participantIds.includes(request.user!.id) && conversation.participantIds.includes(payload.userId))
    );

    response.json({
      success: true,
      message: "User blocked successfully."
    });
  })
);

userRouter.delete(
  "/blocks/:userId",
  requireAuth,
  asyncHandler(async (request, response) => {
    const store = getStore();
    const blockedUserId = Number(request.params.userId);
    store.blocks = store.blocks.filter(
      (entry) => !(entry.blockerId === request.user!.id && entry.blockedId === blockedUserId)
    );

    response.json({
      success: true,
      message: "User unblocked successfully."
    });
  })
);

userRouter.get(
  "/:username",
  asyncHandler(async (request, response) => {
    const store = getStore();
    const viewerId = request.user?.id;
    const user = store.users.find((entry) => entry.username === request.params.username);

    if (!user) {
      throw new AppError("User not found.", 404);
    }
    if (isBlockedBetween(viewerId, user.id)) {
      throw new AppError("You do not have access to this profile.", 403);
    }

    const canViewFullProfile = canViewUserProfile(user, viewerId);

    response.json({
      success: true,
      user: {
        ...serializeUserProfile(user),
        canViewFullProfile
      },
      posts: canViewFullProfile
        ? store.posts.filter((post) => post.userId === user.id).map((post) => serializePost(post, viewerId))
        : [],
      reels: canViewFullProfile
        ? store.reels.filter((reel) => reel.userId === user.id).map((reel) => serializeReel(reel, viewerId))
        : []
    });
  })
);

userRouter.put(
  "/profile",
  requireAuth,
  asyncHandler(async (request, response) => {
    const payload = updateProfileSchema.parse(request.body);
    const store = getStore();
    const currentUser = request.user!;

    const usernameTaken = store.users.some(
      (user) => user.id !== currentUser.id && user.username.toLowerCase() === payload.username.toLowerCase()
    );

    if (usernameTaken) {
      throw new AppError("Username already taken.", 409);
    }

    const phoneTaken = store.users.some((user) => user.id !== currentUser.id && user.phone === payload.phone);
    if (phoneTaken) {
      throw new AppError("This phone number already exists. Please login.", 409);
    }

    Object.assign(currentUser, {
      fullName: payload.fullName,
      username: payload.username,
      phone: payload.phone,
      bio: payload.bio ?? null,
      website: payload.website ?? null,
      location: payload.location ?? null,
      updatedAt: new Date().toISOString()
    });

    response.json({
      success: true,
      message: "Updated successfully.",
      user: serializeUserProfile(currentUser)
    });
  })
);

userRouter.put(
  "/profile/photo",
  requireAuth,
  imageUpload.single("file"),
  asyncHandler(async (request, response) => {
    const currentUser = request.user!;
    currentUser.profileImage = buildPublicFileUrl(request.file) ?? currentUser.profileImage;
    currentUser.updatedAt = new Date().toISOString();

    response.json({
      success: true,
      message: "Updated successfully.",
      user: serializeUserProfile(currentUser)
    });
  })
);

userRouter.delete(
  "/profile/photo",
  requireAuth,
  asyncHandler(async (request, response) => {
    request.user!.profileImage = null;
    request.user!.updatedAt = new Date().toISOString();
    response.json({
      success: true,
      message: "Updated successfully.",
      user: serializeUserProfile(request.user!)
    });
  })
);

userRouter.put(
  "/profile/banner",
  requireAuth,
  imageUpload.single("file"),
  asyncHandler(async (request, response) => {
    const currentUser = request.user!;
    currentUser.coverImage = buildPublicFileUrl(request.file) ?? currentUser.coverImage;
    currentUser.updatedAt = new Date().toISOString();

    response.json({
      success: true,
      message: "Updated successfully.",
      user: serializeUserProfile(currentUser)
    });
  })
);

userRouter.delete(
  "/profile/banner",
  requireAuth,
  asyncHandler(async (request, response) => {
    request.user!.coverImage = null;
    request.user!.updatedAt = new Date().toISOString();
    response.json({
      success: true,
      message: "Updated successfully.",
      user: serializeUserProfile(request.user!)
    });
  })
);

userRouter.put(
  "/settings/account",
  requireAuth,
  asyncHandler(async (request, response) => {
    const payload = updateAccountSchema.parse(request.body);
    const store = getStore();
    const usernameTaken = store.users.some(
      (user) => user.id !== request.user!.id && user.username.toLowerCase() === payload.username.toLowerCase()
    );

    if (usernameTaken) {
      throw new AppError("Username already taken.", 409);
    }

    request.user!.username = payload.username;
    request.user!.isPrivate = payload.profileType === "private";
    request.user!.updatedAt = new Date().toISOString();

    response.json({
      success: true,
      message: "Updated successfully.",
      user: serializeUserProfile(request.user!)
    });
  })
);

userRouter.put(
  "/settings/preferences",
  requireAuth,
  asyncHandler(async (request, response) => {
    const payload = updatePreferencesSchema.parse(request.body);
    Object.assign(request.user!, {
      hobbies: payload.hobbies,
      favoriteNiche: payload.favoriteNiche ?? null,
      favoriteSports: payload.favoriteSports,
      favoriteShows: payload.favoriteShows,
      favoriteAnime: payload.favoriteAnime,
      education: payload.education ?? null,
      location: payload.currentLocation ?? request.user!.location,
      gender: payload.gender ?? null,
      interestedIn: payload.interestedIn ?? null,
      socialLinks: payload.socialLinks,
      customLinks: payload.customLinks,
      updatedAt: new Date().toISOString()
    });

    response.json({
      success: true,
      message: "Updated successfully.",
      user: serializeUserProfile(request.user!)
    });
  })
);

userRouter.put(
  "/settings/experience",
  requireAuth,
  privatePreferenceUpload.single("asset"),
  asyncHandler(async (request, response) => {
    const payload = experienceSchema.parse(request.body);
    request.user!.appThemeId = payload.appThemeId ?? request.user!.appThemeId ?? null;
    request.user!.appThemeCustom = payload.appThemeCustom ?? request.user!.appThemeCustom ?? null;
    request.user!.chatThemeId = payload.chatThemeId ?? request.user!.chatThemeId ?? null;
    request.user!.chatThemeCustom = payload.chatThemeCustom ?? request.user!.chatThemeCustom ?? null;
    request.user!.notificationColor = payload.notificationColor ?? request.user!.notificationColor ?? null;
    request.user!.notificationAudioPath = buildPrivateFilePath(request.file) ?? request.user!.notificationAudioPath ?? null;
    request.user!.updatedAt = new Date().toISOString();

    response.json({
      success: true,
      message: "Updated successfully.",
      user: serializeUserProfile(request.user!)
    });
  })
);

userRouter.put(
  "/settings/security/password",
  requireAuth,
  asyncHandler(async (request, response) => {
    const payload = changePasswordSchema.parse(request.body);
    const matches = await bcrypt.compare(payload.currentPassword, request.user!.passwordHash);
    if (!matches) {
      throw new AppError("Current password is incorrect.", 401);
    }

    request.user!.passwordHash = await bcrypt.hash(payload.newPassword, 10);
    request.user!.updatedAt = new Date().toISOString();

    response.json({
      success: true,
      message: "Password changed successfully."
    });
  })
);

userRouter.post(
  "/settings/security/verification",
  requireAuth,
  privateDocumentUpload.single("file"),
  asyncHandler(async (request, response) => {
    const payload = verificationSchema.parse(request.body);
    if (!request.file) {
      throw new AppError("A verification document is required.", 400);
    }

    request.user!.verificationStatus = "pending_review";
    request.user!.verificationDocumentType = payload.documentType;
    request.user!.verificationDocumentPath = buildPrivateFilePath(request.file);
    request.user!.updatedAt = new Date().toISOString();

    response.json({
      success: true,
      message: "Verification submitted."
    });
  })
);
