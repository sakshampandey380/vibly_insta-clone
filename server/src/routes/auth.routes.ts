import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import { generateToken } from "../utils/auth.js";
import { getStore, nextId, sanitizeUser, serializeUserProfile } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

const signupSchema = z
  .object({
    fullName: z.string().min(2),
    username: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(6),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    bio: z.string().optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password must match password.",
    path: ["confirmPassword"]
  });

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1)
});

export const authRouter = Router();

authRouter.post(
  "/signup",
  asyncHandler(async (request, response) => {
    const payload = signupSchema.parse(request.body);
    const store = getStore();

    const emailExists = store.users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
    const phoneExists = store.users.some((user) => user.phone === payload.phone);
    const usernameExists = store.users.some(
      (user) => user.username.toLowerCase() === payload.username.toLowerCase()
    );

    if (emailExists && phoneExists) {
      throw new AppError("This email and phone number already exist. Please login.", 409);
    }
    if (emailExists) {
      throw new AppError("This email already exists. Please login.", 409);
    }
    if (phoneExists) {
      throw new AppError("This phone number already exists. Please login.", 409);
    }
    if (usernameExists) {
      throw new AppError("This username is already taken. Please choose another one.", 409);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const now = new Date().toISOString();
    const user = {
      id: nextId(store.users),
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      phone: payload.phone,
      passwordHash,
      profileImage: null,
      coverImage: null,
      bio: payload.bio ?? null,
      website: null,
      location: null,
      gender: null,
      education: null,
      interestedIn: null,
      hobbies: [],
      favoriteNiche: null,
      favoriteSports: [],
      favoriteShows: [],
      favoriteAnime: [],
      socialLinks: {},
      customLinks: [],
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      verificationStatus: "not_verified" as const,
      verificationDocumentType: null,
      verificationDocumentPath: null,
      appThemeId: "sky-bloom",
      appThemeCustom: null,
      chatThemeId: "default-glass",
      chatThemeCustom: null,
      notificationColor: "#1d4ed8",
      notificationAudioPath: null,
      isPrivate: false,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    store.users.push(user);

    response.status(201).json({
      success: true,
      message: "Account created successfully.",
      token: generateToken(user.id),
      user: serializeUserProfile(user)
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (request, response) => {
    const payload = loginSchema.parse(request.body);
    const store = getStore();
    const user = store.users.find(
      (entry) =>
        entry.email.toLowerCase() === payload.identifier.toLowerCase() ||
        entry.username.toLowerCase() === payload.identifier.toLowerCase()
    );

    if (!user) {
      throw new AppError("We couldn't find an account with that email or username.", 404);
    }

    const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError("The password you entered is incorrect.", 401);
    }

    response.json({
      success: true,
      message: "Login successful.",
      token: generateToken(user.id),
      user: serializeUserProfile(user)
    });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json({
      success: true,
      user: serializeUserProfile(request.user!)
    });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (_request, response) => {
    response.json({
      success: true,
      message: "Logout successful."
    });
  })
);
