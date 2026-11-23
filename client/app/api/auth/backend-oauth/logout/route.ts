import { cookies } from "next/headers"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("voice_lab_refresh_token")?.value

  let logoutFailed = false
  if (refreshToken) {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    })
    logoutFailed = !response.ok
  }

  cookieStore.delete("voice_lab_access_token")
  cookieStore.delete("voice_lab_refresh_token")

  if (logoutFailed) {
    return Response.json({ detail: "Could not end the API session." }, { status: 502 })
  }

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}
