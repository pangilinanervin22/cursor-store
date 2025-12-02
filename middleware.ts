import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "bookstore_session";
const DELIMITER = "|||";

// Routes that don't require authentication
const publicRoutes = ["/login"];

// API routes that don't require authentication  
const publicApiRoutes = ["/api/uploadthing"];

function validateSession(token: string): { valid: boolean; username?: string } {
  try {
    const secret = process.env.AUTH_SECRET || "default-secret";
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    
    const delimiterIndex = decoded.lastIndexOf(DELIMITER);
    if (delimiterIndex === -1) {
      return { valid: false };
    }
    
    const payload = decoded.substring(0, delimiterIndex);
    const tokenSecret = decoded.substring(delimiterIndex + DELIMITER.length);
    
    if (tokenSecret !== secret) {
      return { valid: false };
    }
    
    const data = JSON.parse(payload);
    
    if (data.expiresAt < Date.now()) {
      return { valid: false };
    }
    
    return { valid: true, username: data.username };
  } catch {
    return { valid: false };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if it's a public API route
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    console.log("No session cookie found, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { valid, username } = validateSession(sessionCookie.value);
  
  if (!valid) {
    console.log("Invalid session, redirecting to login");
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
  
  console.log("Valid session for:", username);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
