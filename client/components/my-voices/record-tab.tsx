"use client"

import {
    FileAudio,
    Mic,
    Pause,
    Play,
    RotateCcw,
    Square,
    X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn, formatFileSize } from "@/lib/utils"
import { useAudioPlayback } from "@/hooks/use-audio-playback"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"

function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    return [hours, minutes, remainingSeconds]
        .map((value) => String(value).padStart(2, "0"))
        .join(":")
}

type RecordTabProps = {
    file: File | null
    onFileChange: (file: File | null) => void
    isInvalid?: boolean
}

export const RecordTab = ({
    file,
    onFileChange,
    isInvalid = false,
}: RecordTabProps) => {
    const { isPlaying, togglePlay } = useAudioPlayback(file)
    const {
        isRecording,
        elapsedTime,
        audioBlob,
        containerRef,
        error,
        startRecording,
        stopRecording,
        resetRecording,
    } = useAudioRecorder()

    const handleStop = () => {
        stopRecording((blob) => {
            const recordedFile = new File([blob], "recording.wav", {
                type: "audio/wav",
            })
            onFileChange(recordedFile)
        })
    }

    const handleReRecord = () => {
        onFileChange(null)
        resetRecording()
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/50 bg-destructive/5 px-6 py-10">
                <p className="text-center text-sm text-destructive" role="alert">
                    {error}
                </p>
                <Button
                    onClick={resetRecording}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    Try again
                </Button>
            </div>
        )
    }

    if (file) {
        return (
            <div className="flex items-center gap-3 rounded-xl border p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileAudio aria-hidden="true" className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                        {audioBlob && elapsedTime > 0 && (
                            <> · {formatTime(elapsedTime)}</>
                        )}
                    </p>
                </div>
                <Button
                    aria-label={isPlaying ? "Pause recording" : "Play recording"}
                    onClick={togglePlay}
                    size="icon-sm"
                    title={isPlaying ? "Pause" : "Play"}
                    type="button"
                    variant="ghost"
                >
                    {isPlaying ? (
                        <Pause aria-hidden="true" className="size-4" />
                    ) : (
                        <Play aria-hidden="true" className="size-4" />
                    )}
                </Button>
                <Button
                    aria-label="Record again"
                    onClick={handleReRecord}
                    size="icon-sm"
                    title="Re-record"
                    type="button"
                    variant="ghost"
                >
                    <RotateCcw aria-hidden="true" className="size-4" />
                </Button>
                <Button
                    aria-label="Remove recording"
                    onClick={handleReRecord}
                    size="icon-sm"
                    title="Remove"
                    type="button"
                    variant="ghost"
                >
                    <X aria-hidden="true" className="size-4" />
                </Button>
            </div>
        )
    }

    if (isRecording) {
        return (
            <div className="flex flex-col overflow-hidden rounded-2xl border">
                <div ref={containerRef} className="w-full" />
                <div className="flex items-center justify-between border-t p-4">
                    <p className="text-[28px] font-semibold leading-[1.2] tracking-tight">
                        {formatTime(elapsedTime)}
                    </p>
                    <Button onClick={handleStop} type="button" variant="destructive">
                        <Square aria-hidden="true" className="size-3" />
                        Stop
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div
            className={cn(
                "flex min-h-52 flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center",
                isInvalid && "border-destructive",
            )}
        >
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <Mic aria-hidden="true" className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
                <p className="text-base font-semibold tracking-tight">Record your voice</p>
                <p className="text-center text-sm text-muted-foreground">
                    Click record to start capturing audio
                </p>
            </div>
            <Button
                onClick={startRecording}
                size="sm"
                type="button"
                variant="outline"
            >
                <Mic aria-hidden="true" className="size-3.5" />
                Record
            </Button>
        </div>
    )
}
