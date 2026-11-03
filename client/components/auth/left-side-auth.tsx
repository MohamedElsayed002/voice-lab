"use client"

import { AudioLines, AudioWaveform, Mic2 } from "lucide-react"
import { useTranslations } from "next-intl"

const waveformBars = [
  24, 42, 30, 58, 38, 72, 48, 86, 54, 38, 66, 94, 56, 76, 44, 64, 34, 82,
  52, 70, 40, 60, 90, 48, 68, 34, 76, 50, 62, 42, 84, 56, 72, 38, 64, 46,
]

export function LeftSidebar() {
  const t = useTranslations("AuthShowcase")

  return (
    <aside className="relative hidden min-h-svh items-center justify-center overflow-hidden bg-[#101115] p-6 text-white lg:flex lg:h-svh lg:min-h-0 xl:p-8">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_12%,rgba(139,92,246,0.2),transparent_38%),radial-gradient(ellipse_at_90%_88%,rgba(34,211,238,0.16),transparent_40%)]"
      />
      <div className="relative flex h-[calc(100svh-3rem)] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1a1b20] via-[#17181c] to-[#13191d] p-6 shadow-2xl shadow-black/30 xl:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white/[0.07] text-cyan-300 ring-1 ring-white/10">
              <AudioWaveform aria-hidden="true" className="size-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">PodForge</span>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[9px] font-semibold tracking-wide text-cyan-200">
            {t("studioBadge")}
          </span>
        </div>

        <div className="mt-6 xl:mt-8">
          <h1 className="max-w-lg text-3xl leading-tight font-semibold tracking-tight xl:text-[2.3rem]">
            {t("headline")}
            <span className="block bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              {t("headlineHighlight")}
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-[13px] leading-5 text-white/55">
            {t("description")}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#0d0f12]/75 p-4 shadow-lg shadow-black/20 xl:mt-6 xl:p-5">
          <div className="flex items-center justify-between gap-3 text-[9px] font-semibold tracking-[0.12em] text-white/50">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
              {t("timeline")}
            </span>
            <span className="rounded bg-cyan-300/10 px-2 py-1 text-cyan-200">
              {t("audioQuality")}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="mt-4 flex h-16 items-center justify-between gap-1"
          >
            {waveformBars.map((height, index) => (
              <span
                key={index}
                className={`w-1 rounded-full ${
                  index % 5 === 0
                    ? "bg-primary"
                    : index % 3 === 0
                      ? "bg-secondary"
                      : "bg-cyan-400"
                }`}
                style={{ height: `${height}%`, opacity: 0.6 + (height / 250) }}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-[10px] text-white/45">
            <span className="flex items-center gap-2">
              <AudioLines aria-hidden="true" className="size-3 text-cyan-300" />
              {t("episode")}
            </span>
            <span>{t("duration")}</span>
          </div>
        </div>

        <figure className="mt-4 rounded-2xl border border-white/[0.06] bg-black/20 p-4 xl:mt-5">
          <blockquote className="text-[13px] leading-5 text-white/75 italic">
            “{t("testimonial")}”
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-cyan-300/15 text-[10px] font-semibold text-cyan-200">
              {t("testimonialInitials")}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-white/85">
                {t("testimonialName")}
              </span>
              <span className="text-[10px] text-white/40">
                {t("testimonialRole")}
              </span>
            </span>
          </figcaption>
        </figure>

        <div className="mt-auto pt-4">
          <p className="text-[9px] font-semibold tracking-[0.14em] text-white/35">
            {t("trustedBy")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-semibold tracking-wide text-white/45">
            <span className="flex items-center gap-1.5">
              <AudioWaveform aria-hidden="true" className="size-3.5" />
              SYNTAX
            </span>
            <span className="flex items-center gap-1.5">
              <Mic2 aria-hidden="true" className="size-3.5" />
              AURA FM
            </span>
            <span className="flex items-center gap-1.5">
              <AudioLines aria-hidden="true" className="size-3.5" />
              VOXWORKS
            </span>
            <span>NEXUS</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
