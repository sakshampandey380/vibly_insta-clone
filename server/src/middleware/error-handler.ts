import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction) {
  next(new AppError("Route not found.", 404));
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message
    });
    return;
  }

  response.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : "Internal server error."
  });
}

