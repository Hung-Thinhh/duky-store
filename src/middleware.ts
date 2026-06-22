import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip static resources, assets, favicon, internal API, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

    // Call resolve redirect endpoint from NestJS backend
    const response = await fetch(
      `${apiUrl}/seo/redirect?path=${encodeURIComponent(pathname)}`,
      {
        // Cache configuration
        next: { revalidate: 60 },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const redirectData = data?.DT || data;

      // If redirect is active and targetPath exists
      if (redirectData && redirectData.targetPath && redirectData.status === "ACTIVE") {
        const statusCode = redirectData.statusCode || 301;
        
        // Ensure absolute URL destination
        const targetUrl = new URL(redirectData.targetPath, request.url);

        // Preserve original query string if any
        if (search) {
          targetUrl.search = search;
        }

        return NextResponse.redirect(targetUrl, statusCode);
      }
    }
  } catch (error) {
    // If backend connection fails, log error and proceed normally (fail-safe)
    console.error("Storefront Redirect Middleware error:", error);
  }

  return NextResponse.next();
}

// Apply middleware to all matching routes except files and APIs
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
