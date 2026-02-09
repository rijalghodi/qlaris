import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "./lib/routes";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./lib/constant";

// Define URL patterns

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

// Helper function to refresh access token using refresh token
const refreshAccessToken = async (
  refreshToken: string,
  apiBaseUrl: string
): Promise<{
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
} | null> => {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Failed to refresh token:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return {
        accessToken: data.data.accessToken,
        accessTokenExpiresAt: data.data.accessTokenExpiresAt,
        refreshToken: data.data.refreshToken,
        refreshTokenExpiresAt: data.data.refreshTokenExpiresAt,
      };
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

// Helper function to get current user from API
const getCurrentUser = async (request: NextRequest) => {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
      return { user: null, response: null };
    }

    const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    let response = await fetch(`${apiBaseUrl}/users/current`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log("Response:", response.status);

    // Handle 401 - try to refresh token
    if (response.status === 401) {
      const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

      if (refreshToken) {
        console.log("Attempting to refresh token...");
        const newTokens = await refreshAccessToken(refreshToken, apiBaseUrl);

        if (newTokens) {
          console.log("Token refreshed successfully");

          // Create response to set new cookies
          const nextResponse = NextResponse.next();

          // Set new access token cookie
          nextResponse.cookies.set(ACCESS_TOKEN_KEY, newTokens.accessToken, {
            expires: new Date(newTokens.accessTokenExpiresAt),
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });

          // Set new refresh token cookie
          nextResponse.cookies.set(REFRESH_TOKEN_KEY, newTokens.refreshToken, {
            expires: new Date(newTokens.refreshTokenExpiresAt),
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });

          // Retry the request with new access token
          response = await fetch(`${apiBaseUrl}/users/current`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newTokens.accessToken}`,
            },
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            return { user: data.data || null, response: nextResponse };
          }
        } else {
          console.log("Token refresh failed");
        }
      }

      // If refresh failed or no refresh token, return null user
      return { user: null, response: null };
    }

    if (!response.ok) {
      throw new Error("Response is not ok", {
        cause: {
          response,
          accessToken,
        },
      });
    }

    const data = await response.json();

    if (!data.data) {
      throw new Error("No user data", {
        cause: {
          data,
          accessToken,
        },
      });
    }

    return { user: data.data, response: null };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return { user: null, response: null };
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // console.log("Pathname:", pathname);

  // Check if current path is in any of the URL categories
  const isProtectedUrl = matchesPattern(pathname, PROTECTED_URL);
  const isAuthUrl = matchesPattern(pathname, AUTH_URL);

  try {
    // Get current user (may refresh token if 401)
    const { user, response: cookieResponse } = await getCurrentUser(request);
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
      // If token was refreshed, return response with new cookies
      if (cookieResponse) {
        return cookieResponse;
      }
      // Allow access to protected pages if authenticated
      return NextResponse.next();
    }

    // Handle PUBLIC URLs (accessible by anyone)
    // If token was refreshed, return response with new cookies
    if (cookieResponse) {
      return cookieResponse;
    }
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
