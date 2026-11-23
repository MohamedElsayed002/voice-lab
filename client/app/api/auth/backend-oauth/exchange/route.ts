import { cookies } from "next/headers"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type TokenResponse = {
  access_token: string
  refresh_token: string
}

function isTokenResponse(value: unknown): value is TokenResponse {
  if (typeof value !== "object" || value === null) return false
  const tokens = value as Record<string, unknown>
  return (
    typeof tokens.access_token === "string" &&
    typeof tokens.refresh_token === "string"
  )
}

export async function POST(request: Request) {
  const body: unknown = await request.json()

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).code !== "string"
  ) {
    return Response.json({ detail: "An OAuth exchange code is required." }, { status: 400 })
  }

  const exchangeResponse = await fetch(
    `${apiUrl.replace(/\/$/, "")}/auth/oauth/exchange`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: (body as { code: string }).code }),
      cache: "no-store",
    },
  )
  if (!exchangeResponse.ok) {
    return Response.json(
      { detail: "OAuth sign-in could not be completed." },
      { status: exchangeResponse.status === 400 ? 400 : 502 },
    )
  }

  const tokens: unknown = await exchangeResponse.json()
  if (!isTokenResponse(tokens)) {
    throw new Error("The API returned invalid authentication tokens.")
  }

  const cookieStore = await cookies()
  const secure = process.env.NODE_ENV === "production"
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
  }
  cookieStore.set("voice_lab_access_token", tokens.access_token, cookieOptions)
  cookieStore.set("voice_lab_refresh_token", tokens.refresh_token, cookieOptions)

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}
