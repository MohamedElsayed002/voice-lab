import {
  AudioLines,
  FileText,
  ListMusic,
  Mic,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

const steps: {
  number: string
  titleKey: "describe" | "chooseVoices" | "generate"
  descriptionKey:
    | "describeDescription"
    | "chooseVoicesDescription"
    | "generateDescription"
  icon: LucideIcon
  iconColor: string
}[] = [
  {
    number: "01",
    titleKey: "describe",
    descriptionKey: "describeDescription",
    icon: ListMusic,
    iconColor: "text-primary",
  },
  {
    number: "02",
    titleKey: "chooseVoices",
    descriptionKey: "chooseVoicesDescription",
    icon: Mic,
    iconColor: "text-secondary",
  },
  {
    number: "03",
    titleKey: "generate",
    descriptionKey: "generateDescription",
    icon: AudioLines,
    iconColor: "text-primary",
  },
]

function StepPreview({ step }: { step: number }) {
  const t = useTranslations("Home.process")

  if (step === 0) {
    return (
      <div
        aria-label={`${t("exampleTopic")}: ${t("remoteTopic")}`}
        className="rounded-lg border border-white/[0.08] bg-background/80 p-3"
      >
        <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
          <span>{t("exampleTopic")}</span>
          <span className="text-primary">{t("conversation")}</span>
        </div>
        <p className="mt-2 rounded-md border border-white/[0.06] bg-card px-2.5 py-2 text-xs leading-5 text-foreground">
          {t("remoteTopic")}
        </p>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground">
            {t("work")}
          </span>
          <span className="rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground">
            {t("culture")}
          </span>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <ul
        aria-label={t("speakerAssignments")}
        className="space-y-2 rounded-lg border border-white/[0.08] bg-background/80 p-2"
      >
        <li className="flex items-center justify-between gap-3 rounded-md border border-white/[0.06] bg-card px-2.5 py-2.5">
          <span className="flex items-center gap-2 text-xs text-foreground">
            <span className="size-2 rounded-full bg-primary" />
            Marcus
            <span className="text-muted-foreground">{t("host")}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">{t("voice", { number: 1 })}</span>
        </li>
        <li className="flex items-center justify-between gap-3 rounded-md border border-white/[0.06] bg-card px-2.5 py-2.5">
          <span className="flex items-center gap-2 text-xs text-foreground">
            <span className="size-2 rounded-full bg-secondary" />
            Elena
            <span className="text-muted-foreground">{t("guest")}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">{t("voice", { number: 2 })}</span>
        </li>
      </ul>
    )
  }

  return (
    <ul
      aria-label={t("deliverables")}
      className="space-y-3 rounded-lg border border-white/[0.08] bg-background/80 p-3"
    >
      {[
        { label: t("script"), icon: FileText },
        { label: t("voiceTracks"), icon: Mic },
        { label: t("mixedAudio"), icon: AudioLines },
      ].map(({ label, icon: Icon }) => (
          <li
            key={label}
            className="flex items-center gap-2.5 text-xs text-foreground"
          >
            <Icon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-secondary"
            />
            {label}
          </li>
      ))}
    </ul>
  )
}

export function Process() {
  const t = useTranslations("Home.process")

  return (
    <section
      aria-labelledby="process-title"
      className="grid place-items-center border-t border-white/[0.08] bg-[#040404] px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-9 max-w-2xl text-center sm:mb-11">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-primary">
            {t("eyebrow")}
          </p>
          <h2
            className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            id="process-title"
          >
            {t("title")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            {t("intro")}
          </p>
        </header>

        <ol className="flex gap-3 md:flex-row flex-col">
          {steps.map(({ number, titleKey, descriptionKey, icon: Icon, iconColor }, index) => (
            <li key={number}>
              <article className="flex h-full flex-col rounded-xl border border-white/[0.09] bg-card/70 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span
                    className={`flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-background ${iconColor}`}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
                    {t("step", { number })}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {t(titleKey)}
                </h3>
                <p className="mt-1.5 min-h-12 text-xs leading-5 text-muted-foreground sm:text-[13px]">
                  {t(descriptionKey)}
                </p>

                <div className="mt-auto pt-4">
                  <StepPreview step={index} />
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
