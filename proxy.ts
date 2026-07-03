import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "local-dev-jwt-secret-key-1234567890"
);
const SESSION_COOKIE_NAME = "ktc_session";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isApiRoute = pathname.startsWith("/api");
  const isVerificationApiRoute = pathname.startsWith("/api/verify");

  // Get session cookie
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const token = cookie?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch (e) {
      // Invalid/expired token
    }
  }

  // Handle protected API routes
  if (isApiRoute) {
    // Exclude public endpoints (login, register - handled inside router, verification API)
    const isPublicApi =
      pathname === "/api/auth/login" ||
      pathname === "/api/auth/register" ||
      isVerificationApiRoute;

    if (!isPublicApi && !session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // API Role-based Access Control
    if (session) {
      if (pathname.startsWith("/api/trainers") && session.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Forbidden: Admins only" } },
          { status: 403 }
        );
      }
      if (pathname.startsWith("/api/templates") && session.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Forbidden: Admins only" } },
          { status: 403 }
        );
      }
      if (pathname.startsWith("/api/organizations") && session.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Forbidden: Admins only" } },
          { status: 403 }
        );
      }
    }
  }

  // Handle protected Dashboard UI routes
  if (isDashboardRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const role = session.role;

    if (pathname.startsWith("/dashboard/admin") && role !== "SUPER_ADMIN") {
      return redirectToCorrectDashboard(role, request.url);
    }

    if (pathname.startsWith("/dashboard/trainer") && role !== "TRAINER") {
      return redirectToCorrectDashboard(role, request.url);
    }

    if (pathname.startsWith("/dashboard/student") && role !== "STUDENT") {
      return redirectToCorrectDashboard(role, request.url);
    }

    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return redirectToCorrectDashboard(role, request.url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && (pathname === "/login" || pathname === "/register")) {
    return redirectToCorrectDashboard(session.role, request.url);
  }

  return NextResponse.next();
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
