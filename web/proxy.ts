import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "./lib/routes";
import { ACCESS_TOKEN_KEY } from "./lib/constant";

// Define URL patterns
const PUBLIC_URL = ["/"];
const PROTECTED_URL = [
  ROUTES.DASHBOARD,
  ROUTES.CATEGORIES,
  ROUTES.PRODUCTS,
  ROUTES.NEW_TRANSACTION,
];
const AUTH_URL = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.SET_PASSWORD,
];

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

    const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${apiBaseUrl}/users/current`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log("Response:", response);

    if (!response.ok) {
      throw new Error("Response is not ok", {
        cause: response,
      });
    }

    const data = await response.json();

    if (!data.data) {
      throw new Error("No user data", {
        cause: data,
      });
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // console.log("Pathname:", pathname);

  // Check if current path is in any of the URL categories
  const isPublicUrl = matchesPattern(pathname, PUBLIC_URL);
  const isProtectedUrl = matchesPattern(pathname, PROTECTED_URL);
  const isAuthUrl = matchesPattern(pathname, AUTH_URL);

  try {
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
  } catch (error) {
    console.error("Error in proxy:", error);
    if (isAuthUrl) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
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
