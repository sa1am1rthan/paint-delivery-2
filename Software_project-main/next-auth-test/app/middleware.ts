import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // console.log("Middleware executed for path:", request.nextUrl.pathname);

  const path = request.nextUrl.pathname

  if (path === '/mappg' || path.startsWith('/mappg/')) {
    // console.log("Handling /mappg route");
    const token = await getToken({ req: request })
    // console.log("Token:", token);

    if (!token) {
      console.log("No token found, redirecting to login");
      return NextResponse.redirect(new URL('/login', request.nextUrl))
    }
  }

  // console.log("Continuing to requested page");
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/mappg',
    '/mappg/:path*',
    '/admin',
    '/unauthorized',
    '/waiting',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}

