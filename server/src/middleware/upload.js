import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/**
 * Memory storage, not disk: the buffer is streamed straight to Cloudinary, so
 * nothing is ever written to a filesystem that may be read-only or wiped
 * between requests on a hosted container.
 */
export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(req, file, cb) {
    if (!ALLOWED.has(file.mimetype)) {
      // Checking the declared mimetype is a convenience guard, not a security
      // boundary — Cloudinary rejects anything that is not really an image.
      return cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  },
}).single("file");

/** Turn multer's own errors into the API's JSON error shape. */
export function handleUpload(req, res, next) {
  uploadSingleImage(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? `File is larger than ${MAX_BYTES / 1024 / 1024} MB`
          : err.message;
      return next(new ApiError(400, message));
    }
    next(err);
  });
}
