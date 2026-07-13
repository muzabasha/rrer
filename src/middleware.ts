import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const protectedRoutes: Record<string, string[]> = {
  "/dashboard": ["FACULTY", "ADMIN", "RESEARCH_DIRECTOR", "EXECUTIVE"],
  "/faculty": ["FACULTY", "ADMIN", "RESEARCH_DIRECTOR"],
  "/clusters": ["FACULTY", "ADMIN", "RESEARCH_DIRECTOR"],
  "/projects": ["FACULTY", "ADMIN", "RESEARCH_DIRECTOR", "SPONSORED_RESEARCH_TEAM"],
  "/consultancy": ["FACULTY", "ADMIN"],
  "/patents": ["FACULTY", "ADMIN", "PATENT_CELL"],
  "/nest": ["FACULTY", "ADMIN", "INNOVATION_CELL"],
  "/phd": ["FACULTY", "PHD_SCHOLAR", "ADMIN", "DOCTORAL_OFFICE"],
  "/students": ["FACULTY", "ADMIN"],
  "/kpi": ["ADMIN", "RESEARCH_DIRECTOR", "DEAN_RESEARCH"],
  "/executive": ["EXECUTIVE", "ADMIN", "DEAN_RESEARCH"],
  "/reports": ["ADMIN", "RESEARCH_DIRECTOR", "DEAN_RESEARCH"],
  "/settings": ["ADMIN"],
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  const { pathname } = request.nextUrl

  const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token) {
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        const userRole = token.role as string
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL("/unauthorized", request.url))
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/faculty/:path*",
    "/clusters/:path*",
    "/projects/:path*",
    "/consultancy/:path*",
    "/patents/:path*",
    "/nest/:path*",
    "/phd/:path*",
    "/students/:path*",
    "/kpi/:path*",
    "/executive/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
}
