import { FileText } from "lucide-react"

import type { Voice } from "./types"

export default function VoiceReferenceCard({ voice }: { voice: Voice }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#141419] p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <FileText aria-hidden="true" className="size-4 text-violet-300" />
        <h2 className="text-sm font-semibold text-slate-100">Reference &amp; training text</h2>
      </div>
      <blockquote className="min-h-32 rounded-xl border border-white/[0.04] bg-[#0f1013] p-4 text-sm leading-7 text-slate-300">
        {voice.reference_text ? (
          `“${voice.reference_text}”`
        ) : (
          <span className="text-muted-foreground">
            No reference text was saved for this voice.
          </span>
        )}
      </blockquote>
    </section>
  )
}
