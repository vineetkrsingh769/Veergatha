import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const cloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
} else {
  // Not fatal. The rest of the API must still boot so the archive stays
  // readable — only the upload route refuses, and it says exactly why.
  const missing = [
    !CLOUD_NAME && "CLOUDINARY_CLOUD_NAME",
    !API_KEY && "CLOUDINARY_API_KEY",
    !API_SECRET && "CLOUDINARY_API_SECRET",
  ].filter(Boolean);
  console.warn(`[media] uploads disabled — missing ${missing.join(", ")}`);
}

/** Everything lands under one prefix, so the account stays tidy and purgeable. */
const FOLDER = "veergatha";

/**
 * Upload a buffer. multer holds the file in memory rather than on disk, which
 * suits a container filesystem that may be read-only or ephemeral.
 */
export function uploadBuffer(buffer, { folder = FOLDER, publicId } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
        // Strip camera EXIF, which on a donated family photo can carry GPS
        // coordinates and device identifiers we have no business republishing.
        image_metadata: false,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

export function destroyAsset(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

/** Delivery URL with automatic format and quality — the sub-3s target depends on this. */
export function optimisedUrl(publicId, { width, height } = {}) {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    ...(width || height
      ? { crop: "fill", gravity: "auto", width, height }
      : {}),
    secure: true,
  });
}

export { cloudinary };
