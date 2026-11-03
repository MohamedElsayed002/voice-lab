"use server"

import { api } from "@/lib/api/client"

export async function getVoices() {
  const { data, error, response } = await api.GET("/voices/")

  if (error || !response.ok) {
    throw new Error("Could not load voices from the API.")
  }

  return data ?? []
}
