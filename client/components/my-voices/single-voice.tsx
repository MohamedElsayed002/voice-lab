"use client"

import { Pause, Play, UserRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import WaveSurfer from "wavesurfer.js"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { components } from "@/lib/api/schema"

type Voice = components["schemas"]["VoiceResponse"]

function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return "0:00"
    const minutes = Math.floor(seconds / 60)
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0")
    return `${minutes}:${remainder}`
}

function playWaveform(wavesurfer: WaveSurfer, voiceName: string, onError: (message: string) => void) {
    void wavesurfer.play().catch((error: unknown) => {
        console.error(`Could not play audio preview for ${voiceName}`, error)
        onError("Could not play this sample.")
    })
}

export const SingleVoice = ({
    voice,
    active,
    onToggle,
}: {
    voice: Voice
    active: boolean
    onToggle: () => void
}) => {
    const waveformRef = useRef<HTMLDivElement>(null)
    const wavesurferRef = useRef<WaveSurfer | null>(null)
    const isReadyRef = useRef(false)
    const activeRef = useRef(active)
    const onToggleRef = useRef(onToggle)
    const [loading, setLoading] = useState(false)
    const [waveformReady, setWaveformReady] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [playbackError, setPlaybackError] = useState("")

    useEffect(() => {
        activeRef.current = active
        onToggleRef.current = onToggle
    }, [active, onToggle])

    useEffect(() => {
        if (!active) {
            wavesurferRef.current?.pause()
            return
        }

        const container = waveformRef.current
        if (!container) return

        const existingWave = wavesurferRef.current
        if (existingWave) {
            if (isReadyRef.current) {
                playWaveform(existingWave, voice.name, (message) => {
                    setPlaybackError(message)
                    if (activeRef.current) onToggleRef.current()
                })
            }
            return
        }

        setLoading(true)
        setWaveformReady(false)
        setPlaybackError("")
        setCurrentTime(0)
        setDuration(0)

        const wavesurfer = WaveSurfer.create({
            container,
            url: `/api/voices/${encodeURIComponent(voice.id)}/audio`,
            fetchParams: { credentials: "same-origin" },
            height: 30,
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            normalize: true,
            cursorWidth: 1,
            cursorColor: "#22d3ee",
            waveColor: "#8b5cf6",
            progressColor: "#22d3ee",
            dragToSeek: true,
          })
        wavesurferRef.current = wavesurfer

        wavesurfer.on("ready", (audioDuration) => {
            isReadyRef.current = true
            setDuration(audioDuration)
            setLoading(false)
            setWaveformReady(true)
            if (activeRef.current) {
                playWaveform(wavesurfer, voice.name, (message) => {
                    setPlaybackError(message)
                    if (activeRef.current) onToggleRef.current()
                })
            }
        })
        wavesurfer.on("timeupdate", setCurrentTime)
        wavesurfer.on("finish", () => {
            setCurrentTime(0)
            if (activeRef.current) onToggleRef.current()
        })
        wavesurfer.on("error", (reason) => {
            console.error(`Could not load audio preview for ${voice.name}`, reason)
            setPlaybackError("Could not load this sample.")
            setLoading(false)
            setWaveformReady(false)
            if (activeRef.current) onToggleRef.current()
        })

    }, [active, voice.id, voice.name])

    useEffect(
        () => () => {
            wavesurferRef.current?.destroy()
            wavesurferRef.current = null
            isReadyRef.current = false
        },
        [],
    )

    function togglePlayback() {
        if (active) {
            wavesurferRef.current?.pause()
        }
        onToggle()
    }

    return (
        <article className="grid min-w-[1040px] grid-cols-[minmax(240px,1fr)_220px_140px_90px_140px_90px] items-center gap-4 border-b border-white/[0.06] px-4 py-4 transition-colors last:border-b-0 hover:bg-white/[0.025]">
            <Link
                className="flex min-w-0 items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                href={`/my-voices/${voice.id}`}
            >
                <Avatar className="size-10 shrink-0 rounded-lg border border-white/10 bg-[#24242b]">
                    <AvatarImage
                        alt={`${voice.name} avatar`}
                        src={voice.avatar_url ?? undefined}
                    />
                    <AvatarFallback className="rounded-lg bg-violet-500/15 text-violet-100">
                        {voice.name ? (
                            voice.name.slice(0, 2).toUpperCase()
                        ) : (
                            <UserRound aria-hidden="true" className="size-4" />
                        )}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-slate-100">
                        {voice.name}
                    </h2>
                    <p className="mt-1 truncate text-xs text-slate-400">
                        {voice.description || "Custom voice"}
                    </p>
                </div>
            </Link>
            <div className="flex min-w-0 items-center gap-2.5">
                <button
                    aria-label={`${active ? "Pause" : "Play"} ${voice.name} sample`}
                    aria-pressed={active}
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-cyan-400 text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141419]"
                    onClick={togglePlayback}
                    type="button"
                >
                    {active ? (
                        <Pause aria-hidden="true" className="size-3.5" fill="currentColor" />
                    ) : (
                        <Play aria-hidden="true" className="ml-0.5 size-3.5" fill="currentColor" />
                    )}
                </button>
                <div className="min-w-0 flex-1">
                    <div className="relative h-8 min-w-0">
                        <div
                            aria-label={`Waveform for ${voice.name}`}
                            className="h-full w-full"
                            ref={waveformRef}
                            role="img"
                        />
                        {!waveformReady && (
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-violet-500/30 via-cyan-400/40 to-violet-500/20"
                            />
                        )}
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-slate-400">
                        <span>{formatTime(currentTime)}</span>
                        <span>{loading ? "Loading" : formatTime(duration)}</span>
                    </div>
                    {playbackError && (
                        <p className="mt-1 truncate text-[10px] text-rose-300" role="alert">
                            {playbackError}
                            <button
                                className="ml-1 underline"
                                onClick={() => {
                                    wavesurferRef.current?.destroy()
                                    wavesurferRef.current = null
                                    isReadyRef.current = false
                                    setWaveformReady(false)
                                    setPlaybackError("")
                                    if (!activeRef.current) onToggleRef.current()
                                }}
                                type="button"
                            >
                                Try again
                            </button>
                        </p>
                    )}
                </div>
            </div>
            <span className="w-fit rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs capitalize text-slate-300">
                {voice.category.replaceAll("_", " ")}
            </span>
            <span className="text-sm text-slate-300">{voice.language.toUpperCase()}</span>
            <time
                className="text-xs text-slate-400"
                dateTime={voice.created_at}
            >
                {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                }).format(new Date(voice.created_at))}
            </time>
            <span
                className={`w-fit rounded-full px-2.5 py-1 text-xs capitalize ${
                    voice.status === "public"
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "bg-slate-500/15 text-slate-300"
                }`}
            >
                {voice.status}
            </span>
        </article>
    )
}