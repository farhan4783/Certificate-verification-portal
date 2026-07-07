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
  if (pathname === "/api/verify/offline" || pathname === "/api/auth/login") {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let appHost = "";
  try {
    appHost = new URL(appUrl).host;
  } catch (e) {
    appHost = "localhost:3000";
  }

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== appHost) return false;
    } catch (e) {
      return false;
    }
  } else if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost !== appHost) return false;
    } catch (e) {
      return false;
    }
  } else {
    return false; // Reject mutations with missing origin/referer
  }

  return true;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isApiRoute = pathname.startsWith("/api");
  const isVerificationApiRoute = pathname.startsWith("/api/verify");
  const isRefreshApiRoute = pathname === "/api/auth/refresh";

  // CSRF Protection
  if (!checkCsrf(request, pathname)) {
    const res = NextResponse.json(
      {
        success: false,
        error: {
          code: "CSRF_ERROR",
          message: "Action forbidden: CSRF validation failed",
        },
      },
      { status: 403 }
    );
    injectSecurityHeaders(res);
    return res;
  }

  // Get session cookie
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const token = cookie?.value;

  let session: any = null;
  let newCookiesToSet: string[] = [];

  const userAgent = request.headers.get("user-agent") || "";
  const currentFingerprint = await hashUserAgent(userAgent);

  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      
      // Fingerprint Pinning Check
      if (payload.userFingerprint && payload.userFingerprint !== currentFingerprint) {
        throw new Error("Session fingerprint mismatch");
      }
      
      session = payload;
    } catch (e) {
      // Access token expired or fingerprint mismatch, attempt refresh rotation
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
            "user-agent": userAgent, // Forward user agent for verification
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
                
                // Double check fingerprint on newly rotated token
                if (!payload.userFingerprint || payload.userFingerprint === currentFingerprint) {
                  session = payload;
                }
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
