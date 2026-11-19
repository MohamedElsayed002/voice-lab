"use client"

import { AlertCircle, Mic2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CustomVoiceDialog } from "./custom-voice-dialog"
import { EmptyVoices } from "./empty-voices"
import { SingleVoice } from "./single-voice"
import { useUserCustomVoices } from "@/hooks/use-voices"


export const MyVoices = () => {
    const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null)
    const voicesQuery = useUserCustomVoices()
    const voices = voicesQuery.data ?? []

    return (
        <div className="flex min-h-0 flex-1 flex-col p-6">
            <header className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">My Voices</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your saved custom voices, ready to use in your projects.
                    </p>
                </div>
                {!voicesQuery.isPending && voices.length > 0 && <CustomVoiceDialog />}
            </header>

            {voicesQuery.isPending ? (
                <div
                    aria-label="Loading custom voices"
                    aria-live="polite"
                    className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground"
                >
                    <Mic2 aria-hidden="true" className="size-4 animate-pulse" />
                    Loading your voices...
                </div>
            ) : voicesQuery.isError ? (
                <div
                    className="flex flex-1 flex-col items-center justify-center gap-3 text-center"
                    role="alert"
                >
                    <AlertCircle aria-hidden="true" className="size-6 text-destructive" />
                    <p className="text-sm text-muted-foreground">
                        {voicesQuery.error instanceof Error
                            ? voicesQuery.error.message
                            : "Could not load your custom voices."}
                    </p>
                    <Button
                        onClick={() => {
                            void voicesQuery.refetch()
                        }}
                        type="button"
                        variant="outline"
                    >
                        Try again
                    </Button>
                </div>
            ) : voices.length === 0 ? (
                <EmptyVoices />
            ) : (
                <div className="min-w-0 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#141419]">
                    <div className="grid min-w-[1040px] grid-cols-[minmax(240px,1fr)_220px_140px_90px_140px_90px] gap-4 border-b border-white/[0.08] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        <span>Voice</span>
                        <span>Sample</span>
                        <span>Category</span>
                        <span>Language</span>
                        <span>Created</span>
                        <span>Visibility</span>
                    </div>
                    {voices.map((voice) => (
                        <SingleVoice
                            key={voice.id}
                            active={activeVoiceId === voice.id}
                            onToggle={() => {
                                setActiveVoiceId((current) =>
                                    current === voice.id ? null : voice.id,
                                )
                            }}
                            voice={voice}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}