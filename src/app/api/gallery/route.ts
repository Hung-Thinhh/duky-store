import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GALLERY_DIR = path.join(process.cwd(), "public", "assets", "gallery");
const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forMaleParam = searchParams.get("forMale");
    if (!fs.existsSync(GALLERY_DIR)) {
      return NextResponse.json([]);
    }
    const files = fs.readdirSync(GALLERY_DIR);

    let images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext);
      })
      .map((file, index) => {
        const lowercaseName = file.toLowerCase();
        // Determine gender category based on filename
        let forMale: boolean | null = null;
        if (lowercaseName.includes("nam") || lowercaseName.includes("men") || lowercaseName.includes("male") || lowercaseName.includes("boy")) {
          forMale = true;
        } else if (lowercaseName.includes("nu") || lowercaseName.includes("women") || lowercaseName.includes("female") || lowercaseName.includes("girl")) {
          forMale = false;
        }
        
        return {
          id: String(index + 1),
          src: `/assets/gallery/${encodeURIComponent(file)}`,
          alt: path.basename(file, path.extname(file)),
          forMale,
        };
      });

    if (forMaleParam !== null && forMaleParam !== undefined) {
      const isMale = forMaleParam === "true";
      images = images.filter((img) => img.forMale === isMale);
    }

    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to read gallery directory:", error);
    return NextResponse.json([], { status: 500 });
  }
}
