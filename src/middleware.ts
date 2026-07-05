import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'quizme_super_secret_jwt_key_1234567890!';
const key = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session')?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, key, {
        algorithms: ['HS256'],
      });
      session = payload;
    } catch (err) {
      // Invalid or expired token
    }
  }

  // Paths requiring authentication
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin');

  const isAdminPath = pathname.startsWith('/admin');

  if (isProtectedPath) {
    if (!session) {
      // Redirect to login if trying to access protected routes without session
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminPath && session.role !== 'ADMIN') {
      // Redirect non-admin users to dashboard
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (pathname === '/login' || pathname === '/') {
    if (session) {
      // Redirect logged-in users away from login/root to dashboard/admin console
      const dashboardUrl = new URL(
        session.role === 'ADMIN' ? '/admin' : '/dashboard',
        request.url
      );
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/quiz/:path*',
    '/leaderboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
