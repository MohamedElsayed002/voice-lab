import { AudioLines } from "lucide-react"

import type { Voice } from "./types"

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value))
}

export default function VoiceDetailsCard({ voice }: { voice: Voice }) {
  const details = [
    { label: "Voice type", value: formatLabel(voice.variant) },
    { label: "Category", value: formatLabel(voice.category) },
    { label: "Language", value: voice.language.toUpperCase() },
    { label: "Visibility", value: formatLabel(voice.status) },
    { label: "Created", value: formatDate(voice.created_at) },
  ]

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#141419] p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AudioLines aria-hidden="true" className="size-4 text-cyan-300" />
          <h2 className="text-sm font-semibold text-slate-100">Voice details</h2>
        </div>
        <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[10px] font-medium text-slate-400">
          PROFILE
        </span>
      </div>

      <dl className="space-y-4">
        {details.map(({ label, value }) => (
          <div className="flex items-center justify-between gap-4" key={label}>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="text-right text-xs font-medium text-slate-200">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
