import express from "express";
import cors from "cors";
import path from "node:path";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { postRouter } from "./routes/post.routes.js";
import { reelRouter } from "./routes/reel.routes.js";
import { messageRouter } from "./routes/message.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads", "public")));

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    message: "Vibly API is running."
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/reels", reelRouter);
app.use("/api/messages", messageRouter);
app.use("/api/notifications", notificationRouter);

app.use(notFoundHandler);
app.use(errorHandler);
