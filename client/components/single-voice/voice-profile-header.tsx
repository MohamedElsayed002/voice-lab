import Link from "next/link"
import { ArrowUpRight, UserRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Voice } from "./types"

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function VoiceProfileHeader({ voice }: { voice: Voice }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141419] p-5 md:p-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,rgba(124,58,237,0.18),transparent_42%),radial-gradient(ellipse_at_15%_100%,rgba(34,211,238,0.08),transparent_38%)]"
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <Avatar className="size-24 shrink-0 rounded-2xl border border-violet-400/20 bg-[#201b31] shadow-[0_0_30px_rgba(124,58,237,0.12)]">
          <AvatarImage alt={`${voice.name} avatar`} src={voice.avatar_url ?? undefined} />
          <AvatarFallback className="rounded-2xl bg-violet-500/15 text-violet-100">
            {voice.name ? (
              voice.name.slice(0, 2).toUpperCase()
            ) : (
              <UserRound aria-hidden="true" className="size-8" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {voice.name}
            </h1>
            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-medium text-violet-200">
              {formatLabel(voice.variant)} Voice
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-violet-500/15 px-2.5 py-1 text-xs text-violet-200">
              {formatLabel(voice.category)}
            </span>
            <span className="rounded-md bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300">
              {voice.language.toUpperCase()}
            </span>
            <span className="rounded-md bg-white/[0.06] px-2.5 py-1 text-xs capitalize text-slate-300">
              {voice.status}
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            {voice.description || "No description has been added for this voice."}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 md:flex-col">
          <Button
            className="bg-violet-600 text-white hover:bg-violet-500"
            render={<Link href="#voice-sample" />}
          >
            Preview sample
          </Button>
          <Button
            className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
            render={<Link href="#voice-information" />}
            variant="outline"
          >
            Edit details
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
