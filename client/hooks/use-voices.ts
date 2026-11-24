"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import {
  createVoice,
  generateTTS,
  getUserCustomVoice,
  getUserCustomVoices,
  getVoices,
} from "@/actions/voices"
import { toast } from "sonner"

export const voicesQueryKey = ["voices"] as const
export const userCustomVoicesQueryKey = ["voices", "mine", "custom"] as const
export const userCustomVoiceQueryKey = (voiceId: string) =>
  [...userCustomVoicesQueryKey, voiceId] as const
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

export function useUserCustomVoices() {
  return useQuery({
    queryKey: userCustomVoicesQueryKey,
    queryFn: getUserCustomVoices,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useUserCustomVoice(voiceId: string) {
  return useQuery({
    queryKey: userCustomVoiceQueryKey(voiceId),
    queryFn: () => getUserCustomVoice(voiceId),
    enabled: Boolean(voiceId),
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



export function useCreateVoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["create-voice"],
    mutationFn: (formData: FormData) => createVoice(formData),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: voicesQueryKey }),
        queryClient.invalidateQueries({ queryKey: userCustomVoicesQueryKey }),
      ]),
  })
}

export function useGenerateTTS() {
  return useMutation({
    mutationKey: ["generate-tts"],
    mutationFn: async ({voice_id, text}: {voice_id: string, text: string}) => {
      const data = await generateTTS(voice_id, text)
      return data
    },
    onSuccess: (data) => {
      console.log(data)
    },
    onError: (error) => {
      toast.error(error.message)
    }

  })
}