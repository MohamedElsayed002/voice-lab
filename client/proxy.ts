import { auth } from "@/lib/auth/server"
import { routing } from "@/i18n/routing"
import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"

const handleI18nRouting = createMiddleware(routing)
const protectedPaths = [
  "/studio",
  "/voices",
  "/text-to-speech",
  "/generate-podcast-debate",
]

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = pathname.match(/^\/de(?:\/|$)/) ? "de" : "en"
  const pathWithoutLocale = pathname.replace(/^\/(?:en|de)(?=\/|$)/, "") || "/"
  const response = handleI18nRouting(request)
  const isProtected = protectedPaths.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`),
  )

  if (!isProtected) {
    return response
  }

  const authResponse = await auth.middleware({
    loginUrl: locale === "de" ? "/de/login" : "/login",
  })(request)

  if (authResponse.status !== 200 || authResponse.headers.has("location")) {
    return authResponse
  }

  const overriddenHeaders = new Set(
    response.headers
      .get("x-middleware-override-headers")
      ?.split(",")
      .filter(Boolean) ?? [],
  )

  for (const headerName of authResponse.headers
    .get("x-middleware-override-headers")
    ?.split(",")
    .filter(Boolean) ?? []) {
    const headerValue = authResponse.headers.get(
      `x-middleware-request-${headerName}`,
    )

    if (headerValue !== null) {
      response.headers.set(
        `x-middleware-request-${headerName}`,
        headerValue,
      )
      overriddenHeaders.add(headerName)
    }
  }

  if (overriddenHeaders.size > 0) {
    response.headers.set(
      "x-middleware-override-headers",
      [...overriddenHeaders].join(","),
    )
  }

  for (const cookie of authResponse.cookies.getAll()) {
    response.cookies.set(cookie)
  }

  return response
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
