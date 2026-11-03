"use server"

import { auth } from "@/lib/auth/server"
import type { AuthUser } from "@/lib/auth/types"

export async function getBackendUser(): Promise<AuthUser | null> {
  const { data: session, error: sessionError } = await auth.getSession()
  if (sessionError) throw new Error("Could not check the current session.")
  if (!session?.user) return null

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) throw new Error("The API URL is not configured.")

  const { data: tokenData, error: tokenError } = await auth.token()
  if (tokenError || !tokenData?.token) {
    throw new Error("Could not retrieve an API access token.")
  }

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/me`, {
    headers: { Authorization: `Bearer ${tokenData.token}` },
    cache: "no-store",
  })
  if (!response.ok) throw new Error("Could not verify your account with the API.")

  const body = (await response.json()) as { user?: Partial<AuthUser> }
  if (!body.user || typeof body.user.id !== "string") {
    throw new Error("The API returned an invalid user profile.")
  }

  return {
    id: body.user.id,
    email: typeof body.user.email === "string" ? body.user.email : null,
    name: typeof body.user.name === "string" ? body.user.name : null,
  }
}
