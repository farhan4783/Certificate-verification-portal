import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "local-dev-jwt-secret-key-1234567890"
);
const SESSION_COOKIE_NAME = "ktc_session";
const REFRESH_COOKIE_NAME = "ktc_refresh";

async function hashUserAgent(userAgent: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(userAgent || "");
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function checkCsrf(request: NextRequest, pathname: string): boolean {
  const method = request.method;
  const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(method);
  if (!isMutation) return true;

  // Exempt public mutation routes
  if (pathname.startsWith("/api/verify") || pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/logout")) {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (!host) return true;

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return true;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (appUrl && new URL(appUrl).host === originHost) return true;
      return false;
    } catch (e) {
      return false;
    }
  } else if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost === host) return true;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (appUrl && new URL(appUrl).host === refererHost) return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  return true;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Verify CSRF for mutation requests
  if (!checkCsrf(request, pathname)) {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden: CSRF check failed" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Extract session token
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session: any = null;

  if (sessionToken) {
    try {
      const { payload } = await jose.jwtVerify(sessionToken, JWT_SECRET);

      // Validate bound fingerprint
      const userAgent = request.headers.get("user-agent") || "";
      const expectedFingerprint = await hashUserAgent(userAgent);

      if (payload.fingerprint === expectedFingerprint) {
        session = payload;
      }
    } catch (err) {
      // Token is invalid or expired
      session = null;
    }
  }

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isApiRoute = pathname.startsWith("/api");
  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isPublicVerifyApiRoute = pathname.startsWith("/api/verify");

  let response: NextResponse | undefined;

  // Handle protected Dashboard UI routes
  if (!response && isDashboardRoute) {
    if (!session) {
      response = NextResponse.redirect(new URL("/login", request.url));
    } else {
      const role = session.role;

      // Role-based Access Control (RBAC) Matrix
      if (pathname.startsWith("/dashboard/admin") && role !== "SUPER_ADMIN") {
        response = redirectToCorrectDashboard(role, request.url);
      } else if (pathname.startsWith("/dashboard/trainer") && role !== "TRAINER" && role !== "SUPER_ADMIN") {
        response = redirectToCorrectDashboard(role, request.url);
      } else if (pathname.startsWith("/dashboard/student") && role !== "STUDENT" && role !== "SUPER_ADMIN") {
        response = redirectToCorrectDashboard(role, request.url);
      }
    }
  }

  // Handle protected API routes
  if (!response && isApiRoute && !isAuthApiRoute && !isPublicVerifyApiRoute) {
    if (!session) {
      response = new NextResponse(
        JSON.stringify({ error: "Unauthorized: Access token missing or invalid" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    } else {
      const role = session.role;

      if (pathname.startsWith("/api/admin") && role !== "SUPER_ADMIN") {
        response = new NextResponse(
          JSON.stringify({ error: "Forbidden: Insufficient privileges" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
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

  // Handle token refresh if session exists & needs renewal
  if (session && session.exp) {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExp = session.exp - now;

    // Refresh if less than 15 minutes remaining (900 seconds)
    if (timeUntilExp < 900) {
      try {
        const newSessionToken = await new jose.SignJWT({
          userId: session.userId,
          email: session.email,
          role: session.role,
          fingerprint: session.fingerprint,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("2h")
          .sign(JWT_SECRET);

        const isProduction = process.env.NODE_ENV === "production";
        const cookieString = `${SESSION_COOKIE_NAME}=${newSessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200; ${isProduction ? "Secure;" : ""}`;
        response.headers.append("Set-Cookie", cookieString);
      } catch (err) {
        console.error("Token refresh failed in proxy:", err);
      }
    }
  }

  injectSecurityHeaders(response);
  return response;
}

function injectSecurityHeaders(response: NextResponse) {
  const securityHeaders = {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: res.cloudinary.com *.cloudinary.com; font-src 'self' data:; connect-src 'self' wss://polygon-rpc.com; frame-ancestors 'none';",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
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
  const res = NextResponse.redirect(new URL(dashboardPath, baseUrl));
  injectSecurityHeaders(res);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo/|templates/).*)",
  ],
};
