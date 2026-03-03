import { NextResponse } from "next/server"

import { auth } from "@/lib/auth-edge"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const pathname = nextUrl.pathname
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isAuthRoute = pathname === "/login" || pathname === "/register"

  if (!isLoggedIn && isDashboardRoute) {
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}

