"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import WaveSurfer from "wavesurfer.js"

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0")
  return `${minutes}:${remainder}`
}

function WaveformPlaceholder({ seed }: { seed: string }) {
  const bars = useMemo(
    () => Array.from({ length: 34 }, (_, index) => {
      const seedValue = seed.charCodeAt(index % Math.max(seed.length, 1)) || 31
      return 18 + ((index * 19 + seedValue * 7) % 68)
    }),
    [seed],
  )

  return (
    <div className="flex h-9 items-center gap-[3px]" aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={index}
          className={`w-[3px] rounded-full ${index % 4 === 0 ? "bg-fuchsia-400" : "bg-violet-400/75"}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}

export function AudioPreview({
  voiceId,
  voiceName,
  audioUrl,
  active,
  onToggle,
  featured = false,
}: {
  voiceId: string
  voiceName: string
  audioUrl: string
  active: boolean
  onToggle: () => void
  featured?: boolean
}) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const onToggleRef = useRef(onToggle)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    onToggleRef.current = onToggle
  }, [onToggle])

  useEffect(() => {
    if (!active || !waveformRef.current) return
    setError("")

    const wave = WaveSurfer.create({
      container: waveformRef.current,
      url: audioUrl,
      height: featured ? 38 : 34,
      barWidth: featured ? 3 : 2,
      barGap: 2,
      barRadius: 3,
      normalize: true,
      cursorWidth: 0,
      waveColor: "#8b5cf6",
      progressColor: "#22d3ee",
      dragToSeek: true,
    })
    wavesurferRef.current = wave
    wave.on("ready", (length) => {
      setDuration(length)
      void wave.play()
    })
    wave.on("timeupdate", setCurrentTime)
    wave.on("finish", () => onToggleRef.current())
    wave.on("error", (reason) => {
      console.error(`Could not load audio preview for ${voiceName}`, reason)
      setError(reason instanceof Error ? reason.message : String(reason))
      onToggleRef.current()
    })

    return () => {
      wave.destroy()
      wavesurferRef.current = null
    }
  }, [active, audioUrl, featured, voiceName])

  return (
    <div className={`flex min-w-0 items-center ${featured ? "gap-3" : "gap-2"}`}>
      <button
        type="button"
        aria-label={active ? `Pause ${voiceName}` : `Play ${voiceName}`}
        onClick={onToggle}
        className={`grid shrink-0 place-items-center rounded-full bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${featured ? "size-10" : "size-7"}`}
      >
        {active ? <Pause className={featured ? "size-4" : "size-3.5"} fill="currentColor" /> : <Play className={featured ? "ml-0.5 size-4" : "ml-0.5 size-3.5"} fill="currentColor" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="relative h-9 overflow-hidden">
          {!active && <WaveformPlaceholder seed={voiceId} />}
          <div ref={waveformRef} className={`absolute inset-0 ${active ? "opacity-100" : "opacity-0"}`} />
        </div>
        {error && <p className="mt-1 truncate text-[10px] text-rose-300" title={error}>Preview failed: {error}</p>}
      </div>
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-slate-400">
        {formatTime(active ? currentTime : duration)}{duration > 0 && !active ? ` / ${formatTime(duration)}` : ""}
      </span>
    </div>
  )
}
