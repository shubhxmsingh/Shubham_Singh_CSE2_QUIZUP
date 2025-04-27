import { authMiddleware } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = (req: NextRequest) => {
  return req.nextUrl.pathname.startsWith('/dashboard');
};

// Define admin routes that require specific roles
const isAdminRoute = (req: NextRequest) => {
  return req.nextUrl.pathname.startsWith('/admin');
};

// Define API routes that should always be accessible with auth
const isAPIAuthRoute = (req: NextRequest) => {
  return (
    req.nextUrl.pathname.startsWith('/api/teacher/dashboard') ||
    req.nextUrl.pathname.startsWith('/api/teacher/active-students') ||
    req.nextUrl.pathname.startsWith('/api/teacher/create-quiz') ||
    req.nextUrl.pathname.startsWith('/api/teacher/quizzes') ||
    req.nextUrl.pathname.startsWith('/api/student/assigned-quizzes') ||
    req.nextUrl.pathname.startsWith('/api/admin/users') ||
    req.nextUrl.pathname.startsWith('/api/admin/update-role')
  );
};

export default authMiddleware({
  publicRoutes: [
    "/", 
    "/sign-in", 
    "/sign-up",
    "/api/teacher/dashboard",
    "/api/teacher/active-students",
    "/api/teacher/create-quiz",
    "/api/teacher/quizzes/:path*",
    "/api/student/assigned-quizzes",
    "/api/debug/auth",
    "/api/debug/create-user",
    "/api/healthcheck",
    "/api/update-user-mapping"
  ],
  afterAuth(auth, req) {
    // If it's an API route that requires auth, just authenticate but don't redirect
    if (isAPIAuthRoute(req)) {
      if (!auth.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.next();
    }

    // For protected UI routes, redirect to sign-in if not authenticated
    if (isProtectedRoute(req)) {
      if (!auth.userId) {
        const signInUrl = new URL('/sign-in', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    // For admin routes, check role
    if (isAdminRoute(req)) {
      const publicMetadata = auth.sessionClaims?.publicMetadata as { role?: string } | undefined;
      const role = publicMetadata?.role;
      if (role?.toLowerCase() !== "admin") {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}; 