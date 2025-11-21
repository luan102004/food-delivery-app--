import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Get user role
    const userRole = token?.role as string;

    // Define role redirects
    const roleRedirects: Record<string, string> = {
      customer: '/customer',
      restaurant: '/restaurant',
      driver: '/driver',
      admin: '/admin/users',
    };

    // Check role-based access
    if (path.startsWith('/restaurant') && userRole !== 'restaurant' && userRole !== 'admin') {
      return NextResponse.redirect(new URL(roleRedirects[userRole] || '/', req.url));
    }

    if (path.startsWith('/driver') && userRole !== 'driver' && userRole !== 'admin') {
      return NextResponse.redirect(new URL(roleRedirects[userRole] || '/', req.url));
    }

    if (path.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL(roleRedirects[userRole] || '/', req.url));
    }

    // If accessing /customer but not customer role, redirect to correct dashboard
    if (path.startsWith('/customer') && userRole !== 'customer' && userRole !== 'admin') {
      return NextResponse.redirect(new URL(roleRedirects[userRole] || '/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes
        if (path === '/' || path.startsWith('/auth') || path.startsWith('/api/auth')) {
          return true;
        }

        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/customer/:path*',
    '/restaurant/:path*',
    '/driver/:path*',
    '/admin/:path*',
  ],
};