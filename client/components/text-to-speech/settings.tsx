"use client"

import { Controller, type UseFormReturn } from "react-hook-form"
import { useTranslations } from "next-intl"

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
import { VoiceAvatar } from "../voices/voice-avatar"

import { US, DE, EG } from "country-flag-icons/react/3x2"

const languages = [
  { code: "en", Flag: US },
  { code: "de", Flag: DE },
  { code: "ar", Flag: EG },
]

const providers = [
  { id: 'chatterbox-turbo', name: 'Chatterbox Turbo' },
  { id: 'chatterbox', name: 'Chatterbox Multilingual V2' },
  { id: 'openai', name: 'OpenAI' }
]

export const Settings = ({
  form,
}: {
  form: UseFormReturn<TextToSpeechFormValues>
}) => {
  const t = useTranslations("TextToSpeech")
  const voicesQuery = useVoices()
  const voices = voicesQuery.data ?? []
  const voiceId = form.watch("voiceId")
  const selectedVoice = voices.find((voice) => voice.id === voiceId)
  const requestedVoiceIsUnavailable =
    Boolean(voiceId) && voicesQuery.isSuccess && !selectedVoice

  const helperText = requestedVoiceIsUnavailable
    ? t("voiceUnavailable")
    : selectedVoice
      ? `${selectedVoice.language} · ${selectedVoice.category.replaceAll("_", " ")}`
      : t("chooseVoice")

  return (
    <section className="space-y-7" aria-label={t("speechSettings")}>
      <div className="space-y-2">
        <label htmlFor="speech-voice" className="text-sm font-medium">
          {t("voice")}
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
                {selectedVoice && (
                  selectedVoice.avatar_url ? (
                    <VoiceAvatar
                      seed={selectedVoice.id}
                      name={selectedVoice.name}
                      avatar={selectedVoice.avatar_url}
                      className="size-7 shrink-0"
                    />
                  ) : (
                    <VoiceOrb seed={selectedVoice.id} size={28} />
                  )
                )}
                <SelectValue className="min-w-0 flex-1">
                  {(value: unknown) => {
                    const voice = typeof value === "string"
                      ? voices.find((item) => item.id === value)
                      : undefined

                    if (voice) return voice.name
                    if (voicesQuery.isPending) return t("loadingVoices")
                    if (voicesQuery.isError) return t("voicesUnavailable")
                    if (voices.length === 0) return t("noVoices")
                    return t("chooseVoicePlaceholder")
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("availableVoices")}</SelectLabel>
                  {voices.map((voice) => (
                    <SelectItem
                      key={voice.id}
                      value={voice.id}
                      className="min-h-14 px-2 py-2"
                    >
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                        <span className="flex w-full min-w-0 items-center gap-2.5">
                          {voice.avatar_url ? <VoiceAvatar name={voice.name} seed={voice.name} avatar={voice.avatar_url} className="size-8 rounded-full" /> : <VoiceOrb seed={voice.name} size={24} />}
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
            {t("chooseVoice")}
          </p>
        )}
        {voicesQuery.isError && (
          <div className="flex items-center justify-between gap-3 text-xs text-destructive">
            <span>{t("loadVoicesError")}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void voicesQuery.refetch()}
            >
              {t("retry")}
            </Button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="voice-provider" className="text-sm font-medium">
          {t("provider")}
        </label>
        <Controller
          control={form.control}
          name="provider"
          render={({ field }) => {
            const selectedProvider = providers.find(
              (provider) => provider.id === field.value
            )

            return (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(typeof value === "string" ? value : "")}
              >
                <SelectTrigger
                  id="voice-provider"
                  className="h-12 w-full justify-start gap-2.5 rounded-xl px-2.5"
                >
                  <SelectValue className="min-w-0 flex-1">
                    {selectedProvider?.name ?? t("chooseProvider")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("availableProviders")}</SelectLabel>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <span>{provider.name}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )
          }}
        />
      </div>


      <div>
        <label htmlFor="voice-language" className="text-sm font-medium">
          {t("language")}
        </label>
        <Controller
          control={form.control}
          name="language"
          render={({ field }) => {
            const selectedLanguage = languages.find(
              (language) => language.code === field.value
            )

            return (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  if (typeof value === "string") field.onChange(value)
                }}
              >
                <SelectTrigger
                  id="voice-language"
                  className="h-12 w-full justify-start gap-2.5 rounded-xl px-2.5"
                >
                  {selectedLanguage && <selectedLanguage.Flag className="h-4 w-4 rounded-sm" />}
                  <SelectValue>
                    {(value: unknown) => {
                      const language = typeof value === "string"
                        ? languages.find((item) => item.code === value)
                        : undefined

                      return language ? t(language.code === "en" ? "english" : language.code === "de" ? "german" : "arabic") : t("chooseLanguage")
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("availableLanguages")}</SelectLabel>
                    {languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        <language.Flag className="h-4 w-4 rounded-sm" />
                        <span>{t(language.code === "en" ? "english" : language.code === "de" ? "german" : "arabic")}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )
          }}
        />
      </div>

      <Controller
        control={form.control}
        name="exaggeration"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="voice-exaggeration" className="text-sm font-medium">
                {t("exaggeration")}
              </label>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums">
                {field.value} / 2
              </span>
            </div>
            <Slider
              id="voice-exaggeration"
              aria-label={t("exaggerationAria")}
              min={0.25}
              max={2}
              step={0.10}
              value={[field.value]}
              onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] ?? 8 : value)}
              className="py-2"
            />
            <div className="flex flex-col text-[11px] text-muted-foreground">
              <span>{t("exaggerationHelp")}</span>
              <span>{t("exaggerationHigh")}</span>
            </div>
          </div>
        )}
      />


      <Controller
        control={form.control}
        name="cfg_weight"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="voice-cfg_weight" className="text-sm font-medium">
                {t("cfgWeight")}
              </label>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums">
                {field.value} / 1.0
              </span>
            </div>
            <Slider
              id="voice-cfg_weight"
              aria-label={t("cfgWeightAria")}
              min={0.0}
              max={1.0}
              step={0.10}
              value={[field.value]}
              onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] ?? 8 : value)}
              className="py-2"
            />
            <div className="flex flex-col text-[11px] text-muted-foreground">
              <span>{t("cfgHigh")}</span>
              <span>{t("cfgLow")}</span>
            </div>
          </div>
        )}
      />


      <Controller
        control={form.control}
        name="temperature"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="voice-temperature" className="text-sm font-medium">
                {t("temperature")}
              </label>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums">
                {field.value} / 2.0
              </span>
            </div>
            <Slider
              id="voice-temperature"
              aria-label={t("temperatureAria")}
              min={0.05}
              max={2.0}
              step={0.10}
              value={[field.value]}
              onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] ?? 8 : value)}
              className="py-2"
            />
            <div className="flex flex-col text-[11px] text-muted-foreground">
              <span>{t("temperatureLow")}</span>
              <span>{t("temperatureHigh")}</span>
            </div>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="repetition_penalty"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="voice-repetition_penalty" className="text-sm font-medium">
                {t("repetitionPenalty")}
              </label>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums">
                {field.value} / 2.0
              </span>
            </div>
            <Slider
              id="voice-repetition_penalty"
              aria-label={t("repetitionPenaltyAria")}
              min={1.0}
              max={2.0}
              step={0.10}
              value={[field.value]}
              onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] ?? 8 : value)}
              className="py-2"
            />
            <div className="flex flex-col text-[11px] text-muted-foreground">
              <span>{t("noPenalty")}</span>
              <span>{t("reduceRepetition")}</span>
              <span>{t("unnaturalWarning")}</span>
            </div>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="min_p"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="voice-min-p" className="text-sm font-medium">
                {t("minP")}
              </label>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums">
                {field.value} / 1.0
              </span>
            </div>
            <Slider
              id="voice-min-p"
              aria-label={t("minPAria")}
              min={0.0}
              max={1.0}
              step={0.05}
              value={[field.value]}
              onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] ?? 8 : value)}
              className="py-2"
            />
            <div className="flex flex-col text-[11px] text-muted-foreground">
              <span>{t("minPHelp")}</span>
              <span>{t("minPHigh")}</span>
            </div>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="top_p"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="voice-top_p" className="text-sm font-medium">
                {t("topP")}
              </label>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums">
                {field.value} / 1.0
              </span>
            </div>
            <Slider
              id="voice-top_p"
              aria-label={t("topPAria")}
              min={0.0}
              max={1.0}
              step={0.10}
              value={[field.value]}
              onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] ?? 8 : value)}
              className="py-2"
            />
            <div className="flex flex-col text-[11px] text-muted-foreground">
              <span>{t("topPAll")}</span>
              <span>{t("topPSample")}</span>
            </div>
          </div>
        )}
      />
    </section>
  )
}
