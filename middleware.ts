// middleware.ts

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    // Admin route protection
    if (isAdminRoute && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthRoute =
          req.nextUrl.pathname.startsWith('/account') ||
          req.nextUrl.pathname.startsWith('/orders') ||
          req.nextUrl.pathname.startsWith('/admin')

        // Require auth for protected routes
        if (isAuthRoute) {
          return !!token
        }

        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/account/:path*', '/orders/:path*', '/admin/:path*'],
}