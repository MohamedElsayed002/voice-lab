"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play, Volume2 } from "lucide-react"
import WaveSurfer from "wavesurfer.js"

import { Button } from "@/components/ui/button"
import type { Voice } from "./types"

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0")
  return `${minutes}:${remainder}`
}

export default function VoiceAudioPlayer({ voice }: { voice: Voice }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [reloadVersion, setReloadVersion] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    setLoading(true)
    setError("")
    setCurrentTime(0)
    setDuration(0)

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      url: `/api/voices/${encodeURIComponent(voice.id)}/audio`,
      height: 96,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      normalize: true,
      cursorWidth: 2,
      cursorColor: "#22d3ee",
      waveColor: "#8b5cf6",
      progressColor: "#22d3ee",
      dragToSeek: true,
    })
    wavesurferRef.current = wavesurfer

    wavesurfer.on("ready", () => {
      setDuration(wavesurfer.getDuration())
      setLoading(false)
    })
    wavesurfer.on("timeupdate", setCurrentTime)
    wavesurfer.on("play", () => setPlaying(true))
    wavesurfer.on("pause", () => setPlaying(false))
    wavesurfer.on("finish", () => {
      setPlaying(false)
      setCurrentTime(0)
    })
    wavesurfer.on("error", (reason) => {
      console.error(`Could not load audio preview for ${voice.name}`, reason)
      setError("Could not load this voice sample.")
      setLoading(false)
      setPlaying(false)
    })

    return () => {
      wavesurfer.destroy()
      wavesurferRef.current = null
    }
  }, [reloadVersion, voice.id, voice.name])

  useEffect(() => {
    wavesurferRef.current?.setVolume(volume)
  }, [volume])

  function togglePlayback() {
    const wavesurfer = wavesurferRef.current
    if (!wavesurfer || loading || error) return
    void wavesurfer.playPause()
  }

  return (
    <section
      className="rounded-2xl border border-white/[0.08] bg-[#141419] p-5 md:p-7"
      id="voice-sample"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Voice sample</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Reference recording for {voice.name}
          </p>
        </div>
        <span className="rounded-md border border-cyan-400/15 bg-cyan-400/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-cyan-300">
          AUDIO PREVIEW
        </span>
      </div>

      <div className="rounded-xl border border-white/[0.05] bg-[#0f1013] p-4 md:p-5">
        <div
          aria-label={`Waveform for ${voice.name}`}
          className="min-h-24"
          ref={containerRef}
          role="img"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            aria-label={playing ? "Pause voice sample" : "Play voice sample"}
            className="size-10 rounded-full bg-violet-600 text-white hover:bg-violet-500"
            disabled={loading || Boolean(error)}
            onClick={togglePlayback}
            size="icon"
            type="button"
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-4" fill="currentColor" />
            ) : (
              <Play aria-hidden="true" className="ml-0.5 size-4" fill="currentColor" />
            )}
          </Button>

          <span aria-live="off" className="min-w-[94px] font-mono text-xs tabular-nums text-slate-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {loading && (
            <span className="text-xs text-muted-foreground">Loading waveform...</span>
          )}

          {error && (
            <>
              <p className="text-xs text-rose-300" role="alert">{error}</p>
              <Button
                onClick={() => setReloadVersion((version) => version + 1)}
                size="sm"
                type="button"
                variant="outline"
              >
                Try again
              </Button>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Volume2 aria-hidden="true" className="size-4 text-slate-400" />
            <input
              aria-label="Sample volume"
              className="w-20 cursor-pointer accent-cyan-400"
              max={1}
              min={0}
              onChange={(event) => setVolume(Number(event.target.value))}
              step={0.01}
              type="range"
              value={volume}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
