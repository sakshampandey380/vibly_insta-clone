import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { AppError } from "../utils/app-error.js";

const publicUploadRoot = path.resolve(process.cwd(), "uploads", "public");
const privateUploadRoot = path.resolve(process.cwd(), "uploads", "private");

fs.mkdirSync(publicUploadRoot, { recursive: true });
fs.mkdirSync(privateUploadRoot, { recursive: true });

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function ensureScopedDirectory(root: string, folder: string) {
  const resolved = path.join(root, folder);
  fs.mkdirSync(resolved, { recursive: true });
  return resolved;
}

function createStorage(root: string, folder: string) {
  return multer.diskStorage({
    destination: (_request, _file, callback) => {
      callback(null, ensureScopedDirectory(root, folder));
    },
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname);
      const baseName = sanitizeFileName(path.basename(file.originalname, extension));
      callback(null, `${Date.now()}-${baseName}${extension}`);
    }
  });
}

function createFileFilter(allowedMimeTypes: string[], errorMessage: string) {
  return (_request: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new AppError(errorMessage, 400));
  };
}

function buildUpload(options: {
  root: string;
  folder: string;
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  errorMessage: string;
}) {
  return multer({
    storage: createStorage(options.root, options.folder),
    limits: {
      fileSize: options.maxSizeBytes
    },
    fileFilter: createFileFilter(options.allowedMimeTypes, options.errorMessage)
  });
}

export const publicMediaUpload = buildUpload({
  root: publicUploadRoot,
  folder: "media",
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime"
  ],
  maxSizeBytes: 20 * 1024 * 1024,
  errorMessage: "Invalid file type. Allowed formats: jpg, jpeg, png, webp, mp4, webm, mov."
});

export const imageUpload = buildUpload({
  root: publicUploadRoot,
  folder: "images",
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSizeBytes: 12 * 1024 * 1024,
  errorMessage: "Invalid file type. Allowed formats: jpg, jpeg, png, webp."
});

export const privateDocumentUpload = buildUpload({
  root: privateUploadRoot,
  folder: "verification",
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf"
  ],
  maxSizeBytes: 10 * 1024 * 1024,
  errorMessage: "Invalid file type. Allowed formats: jpg, jpeg, png, pdf."
});

export const privatePreferenceUpload = buildUpload({
  root: privateUploadRoot,
  folder: "preferences",
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/x-wav"
  ],
  maxSizeBytes: 12 * 1024 * 1024,
  errorMessage: "Invalid file type. Allowed formats: jpg, jpeg, png, webp, mp3, wav, ogg."
});

export function buildPublicFileUrl(file?: Express.Multer.File | null) {
  if (!file) {
    return null;
  }

  const relativePath = path.relative(publicUploadRoot, file.path).replace(/\\/g, "/");
  return `/uploads/${relativePath}`;
}

export function buildPrivateFilePath(file?: Express.Multer.File | null) {
  if (!file) {
    return null;
  }

  return file.path;
}
