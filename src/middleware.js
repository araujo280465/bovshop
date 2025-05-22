import { NextResponse } from 'next/server'

export async function middleware(req) {
  // Get the user from localStorage
  const userStr = req.cookies.get('user')?.value
  const user = userStr ? JSON.parse(userStr) : null

  // If there's no user and trying to access a protected route
  if (!user) {
    const redirectUrl = new URL('/login', req.url)
    // Add the current path as a redirect parameter
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/lotes/:path*',
    '/usuarios/:path*',
    '/clientes/:path*',
    '/lote-imagens/:path*'
  ]
} 