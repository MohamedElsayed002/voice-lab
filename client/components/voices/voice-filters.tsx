"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { VoiceTab } from "@/hooks/use-voices"

const tabLabels: Record<VoiceTab, string> = {
  all: "All voices",
  system: "System voices",
  custom: "My clones",
}

export function VoiceFilters({
  search,
  onSearch,
  tab,
  onTab,
  counts,
  categories,
  category,
  onCategory,
}: {
  search: string
  onSearch: (value: string) => void
  tab: VoiceTab
  onTab: (value: VoiceTab) => void
  counts: Record<VoiceTab, number>
  categories: string[]
  category: string
  onCategory: (value: string) => void
}) {
  return (
    <section className="mb-5 rounded-xl border border-white/[0.08] bg-[#151519] p-3 sm:p-4">
      <div className="mb-4 flex flex-wrap gap-2 border-b border-white/[0.07] pb-3">
        {(Object.keys(tabLabels) as VoiceTab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onTab(key)}
            aria-pressed={tab === key}
            className={`rounded-md px-3 py-2 text-xs font-medium transition ${tab === key ? "bg-violet-600 text-white shadow-sm shadow-violet-950/40" : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"}`}
          >
            {tabLabels[key]} <span className={`ml-1.5 text-[10px] ${tab === key ? "text-violet-200" : "text-slate-500"}`}>{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search voices by name, description, or language..."
            className="h-10 border-white/[0.08] bg-[#0f0f12] pl-9 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
          />
        </label>
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <SlidersHorizontal className="size-3.5 shrink-0 text-slate-500" />
          <button
            type="button"
            onClick={() => onCategory("")}
            aria-pressed={!category}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium transition ${!category ? "bg-violet-500/20 text-violet-200" : "bg-white/[0.04] text-slate-400 hover:text-white"}`}
          >All styles</button>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onCategory(category === item ? "" : item)}
              aria-pressed={category === item}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium capitalize transition ${category === item ? "bg-violet-500/20 text-violet-200" : "bg-white/[0.04] text-slate-400 hover:text-white"}`}
            >{item.replaceAll("_", " ")}</button>
          ))}
        </div>
      </div>
    </section>
  )
}
