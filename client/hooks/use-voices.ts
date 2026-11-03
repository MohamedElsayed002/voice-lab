"use client"

import { useQuery } from "@tanstack/react-query"
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import { getVoices } from "@/actions/voices"

export const voicesQueryKey = ["voices"] as const
export type VoiceTab = "all" | "system" | "custom"

const voiceLibrarySearchParams = {
  q: parseAsString.withDefault(""),
  type: parseAsStringEnum<VoiceTab>(["all", "system", "custom"]).withDefault("all"),
  category: parseAsString.withDefault(""),
  voice: parseAsString.withDefault(""),
}

export function useVoices() {
  return useQuery({
    queryKey: voicesQueryKey,
    queryFn: getVoices,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useVoiceLibraryParams() {
  const [params, setParams] = useQueryStates(voiceLibrarySearchParams, {
    history: "replace",
    shallow: true,
  })

  return {
    params,
    setSearch: (q: string) => setParams({ q }),
    setType: (type: VoiceTab) => setParams({ type }),
    setCategory: (category: string) => setParams({ category }),
    setSelectedVoice: (voice: string | null) => setParams({ voice: voice ?? "" }),
  }
}
