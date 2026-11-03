"use client"

import { useMemo, useState } from "react"
import { AudioLines, Mic2, Sparkles } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { components } from "@/lib/api/schema"
import { useVoiceLibraryParams, useVoices } from "@/hooks/use-voices"
import { FeaturedVoice } from "./featured-voice"
import { VoiceCard } from "./voice-card"
import { VoiceFilters } from "./voice-filters"

type Voice = components["schemas"]["VoiceResponse"]
const EMPTY_VOICES: Voice[] = []

export function VoiceLibrary() {

  const voicesQuery = useVoices()
  const { params, setSearch, setType, setCategory, setSelectedVoice } = useVoiceLibraryParams()
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null)
  const voices = voicesQuery.data ?? EMPTY_VOICES

  const categories = useMemo(
    () => [...new Set(voices.map((voice) => voice.category))].sort(),
    [voices],
  )

  const counts = useMemo(() => ({
    all: voices.length,
    system: voices.filter((voice) => voice.variant === "system").length,
    custom: voices.filter((voice) => voice.variant === "custom").length,
  }), [voices])
  
  const filteredVoices = useMemo(() => {
    const query = params.q.trim().toLocaleLowerCase()
    return voices.filter((voice) => {
      const matchesTab = params.type === "all" || voice.variant === params.type
      const matchesCategory = !params.category || voice.category === params.category
      const searchableText = `${voice.name} ${voice.description} ${voice.language} ${voice.category}`.toLocaleLowerCase()
      return matchesTab && matchesCategory && (!query || searchableText.includes(query))
    })
  }, [params.category, params.q, params.type, voices])

  const featuredVoice = voices.find((voice) => voice.id === params.voice) ?? voices[0]
  const targetVoiceId = activeVoiceId ?? featuredVoice?.id
  const visibleVoices = featuredVoice
    ? filteredVoices.filter((voice) => voice.id !== featuredVoice.id)
    : filteredVoices

  function togglePlayback(voiceId: string) {
    setActiveVoiceId((current) => current === voiceId ? null : voiceId)
  }

  function toggleSelection(voice: Voice) {
    void setSelectedVoice(params.voice === voice.id ? null : voice.id)
  }

  return (
    <div className="min-h-full bg-[#101014] text-slate-100">
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
        <header className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              <Sparkles className="size-3.5" /> Your voice collection
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[30px]">Voice Lab</h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm">
              Explore your AI voices, preview their sound, and choose the right voice for your next project.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 text-xs text-slate-300">
              <AudioLines className="size-3.5 text-cyan-300" />
              <span><strong className="text-white">{voices.length}</strong> voices</span>
            </div>
            {targetVoiceId && (
              <Link
                href={`/text-to-speech?voiceId=${encodeURIComponent(targetVoiceId)}`}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white transition hover:bg-violet-500"
              >
                <Mic2 className="size-3.5" /> Generate speech with this voice
              </Link>
            )}
          </div>
        </header>

        {featuredVoice && (
          <FeaturedVoice
            voice={featuredVoice}
            selected={Boolean(params.voice)}
            active={activeVoiceId === featuredVoice.id}
            onToggle={() => togglePlayback(featuredVoice.id)}
          />
        )}

        <VoiceFilters
          search={params.q}
          onSearch={(q) => void setSearch(q)}
          tab={params.type}
          onTab={(type) => void setType(type)}
          counts={counts}
          categories={categories}
          category={params.category}
          onCategory={(category) => void setCategory(category)}
        />

        {voicesQuery.isPending ? (
          <section aria-busy="true" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="h-[220px] animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.03]" />
            ))}
          </section>
        ) : voicesQuery.isError ? (
          <section className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-6 text-sm text-slate-300">
            Couldn’t load the voice library. Check that the voice service is running, then refresh this page.
          </section>
        ) : filteredVoices.length === 0 ? (
          <section className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 text-center">
            <span className="mb-3 grid size-11 place-items-center rounded-xl bg-violet-500/10 text-violet-300"><AudioLines className="size-5" /></span>
            <h2 className="text-sm font-semibold text-white">{voices.length ? "No matching voices" : "Your voice library is ready"}</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              {voices.length ? "Try another search or clear a filter." : "Voices from your service will appear here with playable waveform previews."}
            </p>
          </section>
        ) : visibleVoices.length === 0 ? (
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 text-center text-xs text-slate-400">
            This voice is shown in the preview above.
          </section>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between px-0.5">
              <h2 className="text-xs font-semibold text-slate-200">Browse voices <span className="ml-1.5 font-normal text-slate-500">{visibleVoices.length}</span></h2>
              {params.voice && <button type="button" onClick={() => void setSelectedVoice(null)} className="text-[10px] text-violet-300 hover:text-violet-200">Clear selection</button>}
            </div>
            <section aria-label="Available voices" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visibleVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  active={activeVoiceId === voice.id}
                  onToggle={() => togglePlayback(voice.id)}
                  selected={params.voice === voice.id}
                  onSelect={() => toggleSelection(voice)}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
