import "server-only"

import { cookies } from "next/headers"

const accessCookie = "voice_lab_access_token"
const refreshCookie = "voice_lab_refresh_token"

export type BackendSession = {
  accessToken: string
  refreshToken: string
}

export async function getBackendSession(): Promise<BackendSession | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(accessCookie)?.value
  const refreshToken = cookieStore.get(refreshCookie)?.value

  if (!accessToken || !refreshToken) return null

  return { accessToken, refreshToken }
}
