import { Activity, AudioLines, Sparkles } from "lucide-react"
import type { components } from "@/lib/api/schema"
import { VoiceOrb } from "@/components/shared/voice-orb"
import { AudioPreview } from "./audio-preview"
import { VoiceAvatar } from "./voice-avatar"

type Voice = components["schemas"]["VoiceResponse"]

export function FeaturedVoice({
  voice,
  selected,
  active,
  onToggle,
}: {
  voice: Voice
  selected: boolean
  active: boolean
  onToggle: () => void
}) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const audioUrl = new URL(`/voices/${encodeURIComponent(voice.id)}/audio`, apiBaseUrl).toString()

  return (
    <section className="relative mb-5 overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-br from-[#1b1a27] via-[#17171e] to-[#13191d] p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-20 size-56 rounded-full bg-violet-500/[0.08] blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0 p-[2px]">
          {/* <VoiceOrb seed={voice.id} size={48} /> */}
          <VoiceAvatar seed={voice.id} name={voice.name} className="size-10"/>
          <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-[#17171e] bg-emerald-400 text-slate-950">
            <Activity className="size-2.5" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Sparkles className="size-3.5 text-amber-300" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">{selected ? "Selected voice" : "Featured voice"}</span>
            {active && <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium text-emerald-300">Now playing</span>}
          </div>
          <div className="flex min-w-0 items-baseline gap-2">
            <h2 className="truncate text-base font-semibold text-white">{voice.name}</h2>
            <span className="shrink-0 text-[10px] text-slate-400">{voice.language} · {voice.category.replaceAll("_", " ")}</span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-400">{voice.description || "A featured pick from your voice collection."}</p>
        </div>
        <div className="w-full sm:max-w-[330px]">
          <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-slate-500"><AudioLines className="size-3" /> Listen to a sample</div>
          <AudioPreview
            voiceId={voice.id}
            voiceName={voice.name}
            audioUrl={audioUrl}
            active={active}
            onToggle={onToggle}
            featured
          />
        </div>
      </div>
    </section>
  )
}
