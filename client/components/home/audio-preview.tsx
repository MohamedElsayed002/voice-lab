import {
  AudioLines,
  AudioWaveform,
  Bolt,
  Captions,
  CheckCircle2,
  FileText,
  Play,
  Volume2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const waveform = [
  10, 20, 15, 30, 19, 36, 24, 42, 26, 34, 18, 29, 14, 25, 40, 23, 32, 17, 28, 38, 21, 31, 15, 26,
  35, 19, 29, 13, 23, 34, 20, 28,
];

function Transcript({ mode }: { mode: "solo" | "conversation" }) {
  const t = useTranslations("Home.audioPreview");
  const lines =
    mode === "solo"
      ? (["soloLineOne", "soloLineTwo", "soloLineThree"] as const)
      : (["conversationLineOne", "conversationLineTwo", "conversationLineThree"] as const);

  return (
    <div className="space-y-2.5">
      {lines.map((key, index) => (
        <p
          key={key}
          className={`rounded-md border-l-2 bg-background/70 px-2.5 py-2 text-[11px] leading-5 text-muted-foreground ${index === 1 ? "border-secondary" : "border-violet-400"}`}
        >
          <span
            className={`mb-0.5 block font-mono text-[10px] font-semibold ${index === 1 ? "text-secondary" : "text-violet-300"}`}
          >
            {mode === "solo"
              ? t("soloSpeaker")
              : index === 1
                ? t("guestSpeaker")
                : t("hostSpeaker")}
          </span>
          {t(key)}
        </p>
      ))}
    </div>
  );
}

export function AudioPreview() {
  const t = useTranslations("Home.audioPreview");

  return (
    <section
      aria-labelledby="audio-preview-title"
      className="border-t border-white/[0.08] bg-[#040404] px-5 py-14 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-8 max-w-lg text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-[10px] font-medium text-secondary">
            <AudioLines className="size-3" />
            {t("badge")}
          </span>
          <h2
            id="audio-preview-title"
            className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {t("title")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("description")}</p>
        </header>
        <Tabs defaultValue="conversation" className="items-center gap-0">
          <TabsList aria-label={t("formatLabel")} className="h-9">
            <TabsTrigger value="solo" className="px-3 text-xs">
              {t("soloTab")}
            </TabsTrigger>
            <TabsTrigger value="conversation" className="px-3 text-xs">
              {t("conversationTab")}
            </TabsTrigger>
          </TabsList>

          {(["solo", "conversation"] as const).map((mode) => (
            <TabsContent key={mode} value={mode} className="mt-5 max-w-6xl text-left">
              <div className="grid gap-5 rounded-xl border border-white/[0.08] bg-card/70 p-4 sm:p-5 md:grid-cols-[0.85fr_1.15fr]">
                <div className="min-w-0 md:border-r md:border-white/[0.08] md:pr-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-xs font-semibold">
                      <FileText className="size-3.5 text-violet-300" />
                      {t("transcriptTitle")}
                    </h3>
                    <span className="text-[9px] text-muted-foreground">{t("synced")}</span>
                  </div>
                  <Transcript mode={mode} />
                  <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <CheckCircle2 className="size-3 text-secondary" />
                    {t("accuracy")}
                  </p>
                </div>

                <div className="flex min-w-0 flex-col justify-center">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-semibold">
                        {mode === "solo" ? t("soloEpisodeTitle") : t("conversationEpisodeTitle")}
                      </h3>
                      <p className="mt-1 text-[10px] text-muted-foreground">{t("masterFormat")}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <span className="rounded bg-muted px-1.5 py-1 text-[9px] text-muted-foreground">
                        WAV
                      </span>
                      <span className="rounded bg-secondary/10 px-1.5 py-1 text-[9px] text-secondary">
                        -14 LUFS
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-between text-[9px] font-medium">
                    <span className="text-violet-300">
                      {mode === "solo" ? t("soloSpeaker") : t("hostSpeaker")}
                    </span>
                    {mode === "conversation" && (
                      <span className="text-secondary">{t("guestSpeaker")}</span>
                    )}
                    <span className="text-violet-300">
                      {mode === "solo" ? t("soloSpeaker") : t("hostSpeaker")}
                    </span>
                  </div>
                  <div className="mt-1 flex h-1 overflow-hidden rounded-full bg-muted">
                    <span className="w-1/3 bg-violet-400" />
                    {mode === "conversation" && <span className="w-1/3 bg-secondary" />}
                    <span className="flex-1 bg-violet-400" />
                  </div>
                  <div
                    className="relative mt-2 flex h-20 items-center justify-around gap-1 overflow-hidden rounded-lg border border-white/[0.07] bg-background/80 px-3"
                    aria-label={t("waveformLabel")}
                  >
                    {waveform.slice(0, mode === "solo" ? 24 : 32).map((height, index) => (
                      <span
                        key={index}
                        aria-hidden="true"
                        className={`w-1 rounded-full ${mode === "conversation" && index > 12 && index < 23 ? "bg-secondary/80" : "bg-violet-400/90"}`}
                        style={{ height }}
                      />
                    ))}
                    <span className="absolute inset-y-2 left-1/2 w-px bg-secondary shadow-[0_0_8px_theme(colors.teal.400)]" />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[9px] text-secondary">
                    <span>01:14</span>
                    <span className="text-muted-foreground">02:34</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-white/[0.06] bg-background/70 p-3">
                    <div className="flex items-center gap-3">
                      <Captions className="size-4 text-muted-foreground" />
                      <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-secondary text-white">
                        <Play className="ml-0.5 size-4 fill-current" />
                      </span>
                      <AudioWaveform className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-1 text-[9px]">1.0x</span>
                      <Volume2 className="size-3.5" />
                      <span className="w-10 rounded-full bg-secondary" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-violet-400/15 bg-violet-400/5 px-3 py-2 text-[10px] text-muted-foreground">
                    <Bolt className="size-3.5 shrink-0 text-secondary" />
                    {t("generatedNote")}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
