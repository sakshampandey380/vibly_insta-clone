import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { getStore } from "../data/store.js";
import { AppError } from "../utils/app-error.js";

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError("Authentication required.", 401));
    return;
  }

  const token = authHeader.replace("Bearer ", "");
  const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };
  const user = getStore().users.find((entry) => entry.id === decoded.userId);

  if (!user) {
    next(new AppError("User account not found.", 401));
    return;
  }

  request.user = user;
  next();
}

