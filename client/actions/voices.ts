"use server"

import { getApiAccessToken } from "@/lib/auth/session"
import { api } from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

export async function createVoice(formData: FormData) {
  const token = await getApiAccessToken()
  if (!token) throw new Error("Sign in to create a voice.")

  const {data, error, response} = await api.POST("/voices/", {
    headers: { Authorization: `Bearer ${token}` },
    body: formData as unknown as components["schemas"]["Body_create_voice_voices__post"],
    cache: "no-store",
  })

  if (error || !response.ok) {
    throw new Error(`Could not create voice (${response.status}).`)
  }

  return data
}

export async function getVoices() {
  const { data, error, response } = await api.GET("/voices/")

  if (error || !response.ok) {
    throw new Error("Could not load voices from the API.")
  }

  return data ?? []
}

export async function getUserCustomVoices() {
  const token = await getApiAccessToken()
  if (!token) throw new Error("Sign in to load your custom voices.")

  const { data, error, response } = await api.GET("/voices/me/custom", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (error || !response.ok) {
    throw new Error(`Could not load custom voices (${response.status}).`)
  }

  return data ?? []
}

export async function getUserCustomVoice(voiceId: string) {
  const token = await getApiAccessToken()
  if (!token) throw new Error("Sign in to load this custom voice.")

  const { data, error, response } = await api.GET(
    "/voices/me/custom/{voice_id}",
    {
      params: { path: { voice_id: voiceId } },
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  )

  if (error || !response.ok) {
    throw new Error(`Could not load custom voice (${response.status}).`)
  }

  return data
}
