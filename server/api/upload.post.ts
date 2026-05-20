import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);
  if (!files?.length) throw createError({ statusCode: 400, message: "No file provided" });

  const file = files[0];
  if (!file?.filename) throw createError({ statusCode: 400, message: "Invalid file" });

  const ext = extname(file.filename).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
  if (!allowed.includes(ext)) throw createError({ statusCode: 400, message: "Only images allowed" });

  const isProd = process.env.NODE_ENV === "production";
  const uploadsDir = isProd
    ? join(process.cwd(), ".output", "public", "uploads")
    : join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  await writeFile(join(uploadsDir, filename), file.data!);

  return { url: `/uploads/${filename}` };
});
