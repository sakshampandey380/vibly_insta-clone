import { Router } from "express";
import { z } from "zod";
import {
  getStore,
  isBlockedBetween,
  nextId
} from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";
import { buildPublicFileUrl, publicMediaUpload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";

const sendMessageSchema = z.object({
  conversationId: z.number().optional(),
  recipientId: z.number().optional(),
  messageText: z.string().trim().optional()
});

export const messageRouter = Router();

messageRouter.use(requireAuth);

messageRouter.get(
  "/conversations",
  asyncHandler(async (request, response) => {
    const store = getStore();
    const conversations = store.conversations
      .filter(
        (conversation) =>
          conversation.participantIds.includes(request.user!.id) &&
          conversation.status !== "pending"
      )
      .map((conversation) => ({
        ...conversation,
        messages: store.messages.filter((message) => message.conversationId === conversation.id),
        participants: store.users
          .filter((user) => conversation.participantIds.includes(user.id))
          .map((user) => ({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            profileImage: user.profileImage
          }))
      }));

    response.json({
      success: true,
      conversations
    });
  })
);

messageRouter.get(
  "/requests",
  asyncHandler(async (request, response) => {
    const store = getStore();
    const requests = store.conversations
      .filter(
        (conversation) =>
          conversation.participantIds.includes(request.user!.id) &&
          conversation.status === "pending"
      )
      .map((conversation) => ({
        ...conversation,
        messages: store.messages.filter((message) => message.conversationId === conversation.id)
      }));

    response.json({
      success: true,
      requests
    });
  })
);

messageRouter.get(
  "/:conversationId",
  asyncHandler(async (request, response) => {
    const store = getStore();
    const conversation = store.conversations.find(
      (entry) => entry.id === Number(request.params.conversationId)
    );

    if (!conversation || !conversation.participantIds.includes(request.user!.id)) {
      throw new AppError("Conversation not found.", 404);
    }

    response.json({
      success: true,
      conversation,
      messages: store.messages.filter((message) => message.conversationId === conversation.id)
    });
  })
);

messageRouter.post(
  "/send",
  publicMediaUpload.single("file"),
  asyncHandler(async (request, response) => {
    const rawPayload = {
      ...request.body,
      conversationId: request.body.conversationId ? Number(request.body.conversationId) : undefined,
      recipientId: request.body.recipientId ? Number(request.body.recipientId) : undefined
    };
    const payload = sendMessageSchema.parse(rawPayload);
    const store = getStore();

    let conversation = payload.conversationId
      ? store.conversations.find((entry) => entry.id === payload.conversationId)
      : undefined;

    if (!conversation && payload.recipientId) {
      conversation = store.conversations.find(
        (entry) =>
          entry.participantIds.includes(request.user!.id) &&
          entry.participantIds.includes(payload.recipientId!) &&
          entry.participantIds.length === 2
      );
    }

    if (!conversation && !payload.recipientId) {
      throw new AppError("A conversationId or recipientId is required.", 400);
    }

    const recipientId =
      payload.recipientId ??
      conversation?.participantIds.find((participantId) => participantId !== request.user!.id);

    if (!recipientId || isBlockedBetween(request.user!.id, recipientId)) {
      throw new AppError("You cannot message this user.", 403);
    }

    if (!conversation) {
      conversation = {
        id: nextId(store.conversations),
        participantIds: [request.user!.id, recipientId],
        status: "pending" as const,
        requestSenderId: request.user!.id,
        themeId: "default-glass",
        customThemeUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.conversations.push(conversation);
    }

    if (conversation.status === "pending" && conversation.requestSenderId === request.user!.id) {
      throw new AppError("Message request sent.", 409);
    }

    const message = {
      id: nextId(store.messages),
      conversationId: conversation.id,
      senderId: request.user!.id,
      messageText: payload.messageText ?? "",
      mediaUrl: buildPublicFileUrl(request.file),
      mediaType: request.file?.mimetype.startsWith("video/") ? "video" as const : request.file ? "image" as const : null,
      status: "delivered" as const,
      createdAt: new Date().toISOString()
    };

    store.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    response.status(201).json({
      success: true,
      message: conversation.status === "pending" ? "Message request sent." : "Message sent successfully.",
      conversationId: conversation.id,
      data: message
    });
  })
);

messageRouter.post(
  "/requests/:conversationId/respond",
  asyncHandler(async (request, response) => {
    const action = z.object({ action: z.enum(["accept", "reject"]) }).parse(request.body);
    const store = getStore();
    const conversation = store.conversations.find((entry) => entry.id === Number(request.params.conversationId));

    if (!conversation || conversation.status !== "pending" || !conversation.participantIds.includes(request.user!.id)) {
      throw new AppError("Message request not found.", 404);
    }

    if (conversation.requestSenderId === request.user!.id) {
      throw new AppError("You cannot review your own request.", 403);
    }

    if (action.action === "accept") {
      conversation.status = "active";
      conversation.updatedAt = new Date().toISOString();
      response.json({
        success: true,
        message: "Message request accepted."
      });
      return;
    }

    store.conversations = store.conversations.filter((entry) => entry.id !== conversation.id);
    store.messages = store.messages.filter((message) => message.conversationId !== conversation.id);

    response.json({
      success: true,
      message: "Message request rejected."
    });
  })
);
