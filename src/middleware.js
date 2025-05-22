import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  return res
}

// Specify which routes should be protected
const protectedRoutes = [
  '/lotes/:path*',
  '/usuarios/:path*',
  '/clientes/:path*',
  '/lote-imagens/:path*'
]

export const config = {
  matcher: protectedRoutes
} 