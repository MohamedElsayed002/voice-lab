"use client"

import { useState } from "react"
import { Check, Star } from "lucide-react"
import type { components } from "@/lib/api/schema"
import { VoiceOrb } from "@/components/shared/voice-orb"
import { AudioPreview } from "./audio-preview"
import { VoiceAvatar } from "./voice-avatar"

type Voice = components["schemas"]["VoiceResponse"]

export function VoiceCard({
  voice,
  active,
  onToggle,
  selected,
  onSelect,
}: {
  voice: Voice
  active: boolean
  onToggle: () => void
  selected: boolean
  onSelect: () => void
}) {
  const [favorite, setFavorite] = useState(false)

  return (
    <article className={`flex min-h-[220px] flex-col rounded-xl border p-4 transition-colors ${selected ? "border-violet-400/70 bg-violet-500/[0.09]" : "border-white/[0.08] bg-[#17171c] hover:border-white/[0.16]"}`}>
      <div className="flex min-w-0 items-start gap-3">
        <div className="rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-400/10 p-0.5">
        <VoiceAvatar seed={voice.id} name={voice.name} className="size-10 rounded-full"/>
          {/* <VoiceOrb seed={voice.id} size={40} /> */}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-slate-100">{voice.name}</h2>
            <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-medium capitalize text-violet-200">{voice.variant}</span>
          </div>
          <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-4 text-slate-400">
            {voice.description || "A distinctive voice for your next project."}
          </p>
        </div>
        <button
          type="button"
          aria-label={favorite ? `Remove ${voice.name} from favorites` : `Add ${voice.name} to favorites`}
          aria-pressed={favorite}
          onClick={() => setFavorite((value) => !value)}
          className={`rounded-md p-1 transition hover:bg-white/5 ${favorite ? "text-amber-300" : "text-slate-500 hover:text-slate-200"}`}
        >
          <Star className="size-3.5" fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] capitalize text-slate-300">{voice.category.replaceAll("_", " ")}</span>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] text-slate-300">{voice.language}</span>
      </div>

      <div className="mt-auto pt-4">
        <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Voice sample</div>
        <AudioPreview
          voiceId={voice.id}
          voiceName={voice.name}
          audioUrl={audioUrlFor(voice.id)}
          active={active}
          onToggle={onToggle}
        />
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3">
          <span className="text-[10px] text-slate-500">{voice.variant === "system" ? "Voice Lab collection" : "Your custom voice"}</span>
          <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={`inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[10px] font-semibold transition ${selected ? "bg-violet-500/20 text-violet-200" : "bg-violet-600 text-white hover:bg-violet-500"}`}
          >
            {selected ? <><Check className="size-3" /> Selected</> : "Select voice"}
          </button>
        </div>
      </div>
    </article>
  )
}

function audioUrlFor(voiceId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  return new URL(`/voices/${encodeURIComponent(voiceId)}/audio`, baseUrl).toString()
}
