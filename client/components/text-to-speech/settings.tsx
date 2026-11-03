"use client"

import { Controller, type UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useVoices } from "@/hooks/use-voices"
import { VoiceOrb } from "@/components/shared/voice-orb"
import type { TextToSpeechFormValues } from "./form-schema"

export const Settings = ({
  form,
}: {
  form: UseFormReturn<TextToSpeechFormValues>
}) => {
  const voicesQuery = useVoices()
  const voices = voicesQuery.data ?? []
  const voiceId = form.watch("voiceId")
  const selectedVoice = voices.find((voice) => voice.id === voiceId)
  const requestedVoiceIsUnavailable =
    Boolean(voiceId) && voicesQuery.isSuccess && !selectedVoice

  const helperText = requestedVoiceIsUnavailable
    ? "That voice is unavailable. Choose another voice to continue."
    : selectedVoice
      ? `${selectedVoice.language} · ${selectedVoice.category.replaceAll("_", " ")}`
      : "Choose the voice you want to use for speech generation."

  return (
    <section className="space-y-7" aria-label="Speech settings">
      <div className="space-y-2">
        <label htmlFor="speech-voice" className="text-sm font-medium">
          Voice
        </label>
        <Controller
          control={form.control}
          name="voiceId"
          render={({ field }) => (
            <Select
              value={field.value || null}
              onValueChange={(value) => field.onChange(typeof value === "string" ? value : "")}
              disabled={voicesQuery.isPending || voices.length === 0}
            >
              <SelectTrigger
                id="speech-voice"
                className="h-12 w-full justify-start gap-2.5 rounded-xl px-2.5"
                aria-describedby="speech-voice-description"
                aria-busy={voicesQuery.isPending}
              >
                {selectedVoice && <VoiceOrb seed={selectedVoice.id} size={28} />}
                <SelectValue className="min-w-0 flex-1">
                  {(value: unknown) => {
                    const voice = typeof value === "string"
                      ? voices.find((item) => item.id === value)
                      : undefined

                    if (voice) return voice.name
                    if (voicesQuery.isPending) return "Loading voices..."
                    if (voicesQuery.isError) return "Voices unavailable"
                    if (voices.length === 0) return "No voices available"
                    return "Choose a voice"
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available voices</SelectLabel>
                  {voices.map((voice) => (
                    <SelectItem
                      key={voice.id}
                      value={voice.id}
                      className="min-h-14 px-2 py-2"
                    >
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                        <span className="flex w-full min-w-0 items-center gap-2.5">
                          <VoiceOrb seed={voice.id} size={24} />
                          <span className="truncate font-medium">{voice.name}</span>
                        </span>
                        <span className="pl-9 text-xs text-muted-foreground">
                          {voice.language} · {voice.variant}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        <p id="speech-voice-description" className="text-xs text-muted-foreground">
          {helperText}
        </p>
        {form.formState.errors.voiceId?.message && (
          <p role="alert" className="text-xs text-destructive">
            {form.formState.errors.voiceId.message}
          </p>
        )}
        {voicesQuery.isError && (
          <div className="flex items-center justify-between gap-3 text-xs text-destructive">
            <span>Couldn’t load voices. Check your connection and try again.</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void voicesQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      <Controller
        control={form.control}
        name="stability"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="voice-stability" className="text-sm font-medium">
                Stability
              </label>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums">
                {field.value} / 10
              </span>
            </div>
            <Slider
              id="voice-stability"
              aria-label="Voice stability"
              min={1}
              max={10}
              step={1}
              value={[field.value]}
              onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] ?? 8 : value)}
              className="py-2"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>More expressive</span>
              <span>More consistent</span>
            </div>
          </div>
        )}
      />
    </section>
  )
}
