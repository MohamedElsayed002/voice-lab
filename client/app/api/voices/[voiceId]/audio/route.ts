import { getApiAccessToken } from "@/lib/auth/session"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ voiceId: string }> },
) {
  const { voiceId } = await params
  const token = await getApiAccessToken()
  if (!token) {
    return Response.json({ detail: "Could not retrieve an API access token." }, { status: 401 })
  }

  const audioResponse = await fetch(
    `${apiBaseUrl.replace(/\/$/, "")}/voices/me/custom/${encodeURIComponent(voiceId)}/audio`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  )

  const headers = new Headers({
    "Cache-Control": "private, no-store",
  })
  for (const headerName of ["content-type", "content-length"]) {
    const value = audioResponse.headers.get(headerName)
    if (value) headers.set(headerName, value)
  }

  return new Response(audioResponse.body, {
    status: audioResponse.status,
    headers,
  })
}
