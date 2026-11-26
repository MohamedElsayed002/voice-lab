"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AudioLines, PanelRightClose, PanelRightOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useGenerateTTS, useVoices } from "@/hooks/use-voices"
import { Settings } from "./settings"
import { History } from "./history"
import { VoiceAvatar } from "../voices/voice-avatar"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { textToSpeechSchema, type TextToSpeechFormValues } from "./form-schema"
import { textSuggestions } from "./constants"
import VoiceAudioPlayer from "../single-voice/voice-audio-player"

const MAX_TEXT_LENGTH = 2000



export const TextToSpeech = ({ voiceId }: { voiceId?: string }) => {
  const t = useTranslations("TextToSpeech")

  const [settingsOpen, setSettingsOpen] = useState(true)
  const [content, setContent] = useState<"settings" | "history">("settings")

  const [audioUrl, setAudioUrl] = useState<string | null>(null)


  const { mutate: generateTextMutate, isPending: generateTextLoading } = useGenerateTTS()

  const form = useForm<TextToSpeechFormValues>({
    resolver: zodResolver(textToSpeechSchema),
    mode: "onChange",
    defaultValues: {
      text: "",
      voiceId: voiceId ?? "",
      exaggeration: 0.5,
      cfg_weight: 0.5,
      temperature: 0.8,
      repetition_penalty: 1.2,
      min_p: 0.05,
      top_p: 1.0,
      language: "en"
    },
  })

  const text = useWatch({ control: form.control, name: "text" })
  const selectedVoiceId = useWatch({ control: form.control, name: "voiceId" })
  const voicesQuery = useVoices()
  const selectedVoice = voicesQuery.data?.find((voice) => voice.id === selectedVoiceId)
  const textTooLong = text.length > MAX_TEXT_LENGTH

  function handleGenerate(values: TextToSpeechFormValues) {

    const payload = {
      text: values.text,
      voice_id: values.voiceId,
      language: values.language,
      metadata: {
        "exaggeration": values.exaggeration,
        "min_p": values.min_p,
        "top_p": values.top_p,
        "cfg_weight": values.cfg_weight,
        "temperature": values.temperature,
        "repetition_penalty": values.repetition_penalty
      }
    }


    generateTextMutate(payload, {
      onSuccess: (data) => {
        setAudioUrl(data.audio_url)
      }
    })
  }

  return (
    <form
      className="flex min-h-0 flex-1"
      onSubmit={form.handleSubmit(handleGenerate)}
    >
      <main className="min-w-0 flex-1 p-6" aria-label={t("title")}>
        <header className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{t("title")}</h1>
            {selectedVoice && (
              <div className="mt-3 flex min-w-0 items-center gap-3">
                <VoiceAvatar seed={selectedVoice.id} avatar={selectedVoice.avatar_url ?? undefined} name={selectedVoice.name} className="size-12" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{selectedVoice.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedVoice.language} · {selectedVoice.category.replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            )}

          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={settingsOpen ? t("closeVoiceSettings") : t("openVoiceSettings")}
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            {settingsOpen ? <PanelRightClose /> : <PanelRightOpen />}
          </Button>
        </header>
        <section className="mt-6 rounded-xl border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="script-label">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Label id="script-label" htmlFor="speech-text" className="text-sm font-semibold">
              {t("textToSpeak")}
            </Label>
            <span
              className={`text-xs tabular-nums ${textTooLong ? "font-medium text-destructive" : "text-muted-foreground"}`}
              aria-live="polite"
            >
              {text.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
            </span>
          </div>
          <Textarea
            id="speech-text"
            placeholder={t("placeholder")}
            aria-describedby="speech-text-help speech-text-error"
            aria-invalid={textTooLong || Boolean(form.formState.errors.text)}
            className={`field-sizing-fixed h-[min(40vh,560px)] resize-none min-h-[320px]  rounded-xl p-4 text-base leading-7 placeholder:text-muted-foreground/70 ${textTooLong
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
              : ""
              }`}
            {...form.register("text")}
          />
          <div className="mt-2 flex min-h-5 items-start justify-between gap-3">
            <p id="speech-text-help" className="text-xs text-muted-foreground">
              {t("editorHelp")}
            </p>
            {form.formState.errors.text && (
              <p id="speech-text-error" role="alert" className="shrink-0 text-xs font-medium text-destructive">
                {textTooLong ? t("tooLong") : t("textRequired")}
              </p>
            )}
          </div>
          {!textTooLong && <span id="speech-text-error" className="sr-only" />}

          <div className="mt-6 border-t pt-5">
            <div className="mb-3">
              <h2 className="text-sm font-semibold">{t("startingPoint")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("startingPointHelp")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {textSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.tone}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue("text", t(`samples.${suggestion.tone}`), {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })}
                  className="rounded-full px-3"
                >
                  {t(`tones.${suggestion.tone}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse items-start justify-between gap-3 border-t pt-5 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              {selectedVoice
                ? t("readyWithVoice", { name: selectedVoice.name })
                : t("chooseVoiceToContinue")}
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={!text.trim() || textTooLong || !selectedVoice || generateTextLoading}
              className="w-full gap-2 sm:w-auto"
            >
              <AudioLines aria-hidden="true" />
              {t("generateAudio")}
            </Button>
          </div>
        </section>

        <section className="w-full my-5">
          {selectedVoice && audioUrl && (
            <VoiceAudioPlayer
              voice={selectedVoice}
              audioUrl={audioUrl ?? undefined}
            />
          )}
        </section>
      </main>

      <aside
        aria-label={t("voiceSettings")}
        aria-hidden={!settingsOpen}
        className={`sticky top-0 h-svh max-h-svh shrink-0 self-start overflow-x-hidden overflow-y-auto border-l bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear ${settingsOpen ? "w-2/3 md:w-1/3" : "w-0 border-l-0"
          }`}
      >
        <div className="w-full min-w-0">
          <div className="flex flex-col gap-0.5 p-4">
            <div className="grid grid-cols-2 border-b" role="tablist" aria-label={t("tabsLabel")}>
              {(["settings", "history"] as const).map((tab) => (
                <button
                  key={tab}
                  id={`${tab}-tab`}
                  type="button"
                  role="tab"
                  aria-selected={content === tab}
                  aria-controls={`${tab}-panel`}
                  tabIndex={content === tab ? 0 : -1}
                  onClick={() => setContent(tab)}
                  className={`border-b-2 px-3 py-2.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${content === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                >
                  {tab === "settings" ? t("settingsTab") : t("historyTab")}
                </button>
              ))}
            </div>
            {/* Content */}
            <div id={`${content}-panel`} role="tabpanel" aria-labelledby={`${content}-tab`} className="pt-3">
              {content === "settings" ? (
                <Settings form={form} />
              ) : (
                <History />
              )}
            </div>
          </div>
        </div>
      </aside>
    </form>
  )
}
