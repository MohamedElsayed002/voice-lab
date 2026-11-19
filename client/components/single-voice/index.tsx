"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, Mic2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useUserCustomVoice } from "@/hooks/use-voices"
import VoiceAudioPlayer from "./voice-audio-player"
import VoiceDetailsCard from "./voice-details-card"
import VoiceEditForm from "./voice-edit-form"
import VoiceProfileHeader from "./voice-profile-header"
import VoiceReferenceCard from "./voice-reference-card"

export function SingleVoice({ voiceId }: { voiceId: string }) {
  const voiceQuery = useUserCustomVoice(voiceId)

  if (voiceQuery.isPending) {
    return (
      <div
        aria-label="Loading voice"
        aria-live="polite"
        className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <Mic2 aria-hidden="true" className="size-4 animate-pulse" />
        Loading voice...
      </div>
    )
  }

  if (voiceQuery.isError) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle aria-hidden="true" className="size-7 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {voiceQuery.error instanceof Error
            ? voiceQuery.error.message
            : "Could not load this voice."}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => void voiceQuery.refetch()} type="button" variant="outline">
            Try again
          </Button>
          <Button render={<Link href="/my-voices" />} variant="ghost">
            Back to My Voices
          </Button>
        </div>
      </main>
    )
  }

  const voice = voiceQuery.data

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-5 md:p-8">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        href="/my-voices"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to My Voices
      </Link>

      <VoiceProfileHeader voice={voice} />
      <VoiceAudioPlayer voice={voice} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
        <VoiceReferenceCard voice={voice} />
        <VoiceDetailsCard voice={voice} />
      </div>
      <VoiceEditForm id="voice-information" voice={voice} />
    </main>
  )
}
