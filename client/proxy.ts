import { routing } from "@/i18n/routing"
import createMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"

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

  const isVoiceAudioApi = pathname.startsWith("/api/voices/")

  const response = isVoiceAudioApi ? NextResponse.next() : handleI18nRouting(request)

  const isProtected = isVoiceAudioApi || protectedPaths.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`),
  )

  if (!isProtected) {
    return response
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    "/api/voices/:path*",
  ],
}