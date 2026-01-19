import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define URL patterns
const PUBLIC_URL = ["/"];
const PROTECTED_URL = ["/dashboard", "/products", "/orders"];
const AUTH_URL = ["/login", "/register", "/forgot-password", "/reset-password", "/set-password"];

// Helper function to check if the path matches any pattern
const matchesPattern = (pathname: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => {
    // Exact match
    if (pathname === pattern) return true;
    // Prefix match (e.g., /dashboard matches /dashboard/*)
    if (pathname.startsWith(pattern + "/")) return true;
    return false;
  });
};

// Helper function to get current user from API
const getCurrentUser = async (request: NextRequest) => {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
      return null;
    }

    // Get cookies from the request
    const cookies = request.cookies.toString();

    console.log("Cookies:", cookies);

    const response = await fetch(`${apiBaseUrl}/users/current`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
      credentials: "include",
    });

    console.log("Response:", response.ok);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // console.log("Data:", data);

    // Check if the response has success flag and data
    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current path is in any of the URL categories
  const isPublicUrl = matchesPattern(pathname, PUBLIC_URL);
  const isProtectedUrl = matchesPattern(pathname, PROTECTED_URL);
  const isAuthUrl = matchesPattern(pathname, AUTH_URL);

  // Get current user
  const user = await getCurrentUser(request);
  const isAuthenticated = !!user;

  // Handle AUTH URLs (login, register, etc.)
  if (isAuthUrl) {
    if (isAuthenticated) {
      // Redirect to dashboard if already authenticated
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Allow access to auth pages if not authenticated
    return NextResponse.next();
  }

  // Handle PROTECTED URLs
  if (isProtectedUrl) {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Allow access to protected pages if authenticated
    return NextResponse.next();
  }

  // Handle PUBLIC URLs (accessible by anyone)
  // No restrictions, allow access
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
