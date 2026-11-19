"use client"

import { FileAudio, Pause, Play, Upload, X } from "lucide-react"
import { useRef } from "react"

import { useAudioPlayback } from "@/hooks/use-audio-playback"
import { Button } from "@/components/ui/button"
import { cn, formatFileSize } from "@/lib/utils"

type UploadTabProps = {
    file: File | null
    onFileChange: (file: File | null) => void
    isInvalid?: boolean
}

export const UploadTab = ({
    file,
    onFileChange,
    isInvalid = false,
}: UploadTabProps) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const { isPlaying, togglePlay } = useAudioPlayback(file)

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
                    </p>
                </div>
                <Button
                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
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
                    aria-label="Remove audio file"
                    onClick={() => onFileChange(null)}
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

    return (
        <div
            className={cn(
                "flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 p-6 text-center",
                isInvalid && "border-destructive",
            )}
        >
            <input
                accept=".wav,audio/wav,audio/x-wav,audio/wave"
                aria-label="Choose a WAV audio file"
                className="sr-only"
                onChange={(event) => {
                    const selectedFile = event.target.files?.[0] ?? null
                    onFileChange(selectedFile)
                    event.target.value = ""
                }}
                ref={inputRef}
                tabIndex={-1}
                type="file"
            />
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload aria-hidden="true" className="size-5" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium">Upload a voice sample</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                    Choose an audio file with a clear recording and minimal background noise.
                </p>
            </div>
            <Button
                className="mt-1 gap-2"
                onClick={() => inputRef.current?.click()}
                type="button"
                variant="outline"
            >
                <Upload aria-hidden="true" />
                Choose audio file
            </Button>
            <p className="text-xs text-muted-foreground">
                WAV audio only
            </p>
        </div>
    )
}
