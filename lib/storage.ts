import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export function validateFile(file: File): {
  valid: boolean;
  error?: string;
  type: "IMAGE" | "VIDEO";
} {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return { valid: false, error: "Unsupported file type", type: "IMAGE" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File too large (max 100MB)", type: "IMAGE" };
  }

  return { valid: true, type: isImage ? "IMAGE" : "VIDEO" };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
}

export async function saveFile(
  file: File
): Promise<{ filename: string; url: string }> {
  await ensureUploadDir();

  const ext = path.extname(file.name) || "";
  const filename = `${uuidv4()}${ext ? `-${sanitizeFilename(path.basename(file.name, ext))}` : ""}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return { filename, url: `/uploads/${filename}` };
}

export async function deleteFile(url: string): Promise<void> {
  const filename = path.basename(url);
  const filepath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filepath);
  } catch {
    // File may already be deleted
  }
}
