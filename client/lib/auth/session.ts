"use server"

import { getBackendSession } from "@/lib/auth/backend-session"

export async function getApiAccessToken(): Promise<string | null> {
  const backendSession = await getBackendSession()
  return backendSession?.accessToken ?? null
}