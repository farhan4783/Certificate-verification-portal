import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "local-dev-jwt-secret-key-1234567890"
);
const SESSION_COOKIE_NAME = "ktc_session";
const REFRESH_COOKIE_NAME = "ktc_refresh";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isApiRoute = pathname.startsWith("/api");
  const isVerificationApiRoute = pathname.startsWith("/api/verify");
  const isRefreshApiRoute = pathname === "/api/auth/refresh";

  // Get session cookie
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const token = cookie?.value;

  let session: any = null;
  let newCookiesToSet: string[] = [];

  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch (e) {
      // Access token expired, attempt refresh rotation
    }
  }

  // If token is invalid/expired but refresh cookie exists, request token rotation
  if (!session && !isRefreshApiRoute) {
    const refreshCookie = request.cookies.get(REFRESH_COOKIE_NAME);
    if (refreshCookie?.value) {
      try {
        const refreshRes = await fetch(new URL("/api/auth/refresh", request.url), {
          method: "POST",
          headers: {
            cookie: `${SESSION_COOKIE_NAME}=${token || ""}; ${REFRESH_COOKIE_NAME}=${refreshCookie.value}`,
          },
        });

        if (refreshRes.ok) {
          const setCookies = refreshRes.headers.getSetCookie();
          if (setCookies && setCookies.length > 0) {
            newCookiesToSet = setCookies;
            const accessCookieStr = setCookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
            if (accessCookieStr) {
              const match = accessCookieStr.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
              if (match && match[1]) {
                const { payload } = await jose.jwtVerify(match[1], JWT_SECRET);
                session = payload;
              }
            }
          }
        }
      } catch (err) {
        // Fallback or ignore
      }
    }
  }

  let response: NextResponse | null = null;

  // Handle protected API routes
  if (isApiRoute) {
    const isPublicApi =
      pathname === "/api/auth/login" ||
      pathname === "/api/auth/register" ||
      isRefreshApiRoute ||
      isVerificationApiRoute;

    if (!isPublicApi && !session) {
      response = NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    } else if (session) {
      // API Role-based Access Control
      if (pathname.startsWith("/api/trainers") && session.role !== "SUPER_ADMIN") {
        response = NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Forbidden: Admins only" } },
          { status: 403 }
        );
      } else if (pathname.startsWith("/api/templates") && session.role !== "SUPER_ADMIN") {
        response = NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Forbidden: Admins only" } },
          { status: 403 }
        );
      } else if (pathname.startsWith("/api/organizations") && session.role !== "SUPER_ADMIN") {
        response = NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Forbidden: Admins only" } },
          { status: 403 }
        );
      }
    }
  }

  // Handle protected Dashboard UI routes
  if (!response && isDashboardRoute) {
    if (!session) {
      response = NextResponse.redirect(new URL("/login", request.url));
    } else {
      const role = session.role;

      if (pathname.startsWith("/dashboard/admin") && role !== "SUPER_ADMIN") {
        response = redirectToCorrectDashboard(role, request.url);
      } else if (pathname.startsWith("/dashboard/trainer") && role !== "TRAINER") {
        response = redirectToCorrectDashboard(role, request.url);
      } else if (pathname.startsWith("/dashboard/student") && role !== "STUDENT") {
        response = redirectToCorrectDashboard(role, request.url);
      } else if (pathname === "/dashboard" || pathname === "/dashboard/") {
        response = redirectToCorrectDashboard(role, request.url);
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (!response && session && (pathname === "/login" || pathname === "/register")) {
    response = redirectToCorrectDashboard(session.role, request.url);
  }

  // Default fallback if no redirection or error json is created
  if (!response) {
    response = NextResponse.next();
  }

  // Inject rotated session cookies into response headers if rotated
  if (newCookiesToSet.length > 0) {
    newCookiesToSet.forEach((cookieString) => {
      response!.headers.append("Set-Cookie", cookieString);
    });
  }

  return response;
}

function redirectToCorrectDashboard(role: string, baseUrl: string) {
  let dashboardPath = "/login";
  if (role === "SUPER_ADMIN") {
    dashboardPath = "/dashboard/admin";
  } else if (role === "TRAINER") {
    dashboardPath = "/dashboard/trainer";
  } else if (role === "STUDENT") {
    dashboardPath = "/dashboard/student";
  }
  return NextResponse.redirect(new URL(dashboardPath, baseUrl));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo/ (logos)
     * - templates/ (templates)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo/|templates/).*)",
  ],
};
