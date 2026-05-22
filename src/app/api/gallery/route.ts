import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GALLERY_DIR = path.join(process.cwd(), "public", "assets", "gallery");
const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];

export async function GET() {
  try {
    const files = fs.readdirSync(GALLERY_DIR);

    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext);
      })
      .map((file, index) => ({
        id: String(index + 1),
        src: `/assets/gallery/${encodeURIComponent(file)}`,
        alt: path.basename(file, path.extname(file)),
      }));

    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to read gallery directory:", error);
    return NextResponse.json([], { status: 500 });
  }
}
