import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // 1. Validate auth
  const authHeader = request.headers.get("authorization");
  const secret = process.env.REVALIDATION_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  const body = await request.json();
  const { path, tag } = body;

  if (!path && !tag) {
    return NextResponse.json({ error: "Missing path or tag" }, { status: 400 });
  }

  // 3. Revalidate
  try {
    if (path) {
      revalidatePath(path);
      // Cascade: if product path, also revalidate collections
      if (path.startsWith("/san-pham")) {
        revalidateTag("collections", "max");
      }
    }
    if (tag) {
      revalidateTag(tag, "max");
    }
    return NextResponse.json({ revalidated: true });
  } catch (err) {
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
