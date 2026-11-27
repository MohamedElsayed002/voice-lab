import Image from "next/image";
import {
  AudioLines,
  AudioWaveform,
  BookOpenText,
  FileText,
  Mic2,
  WandSparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

const waveform = [12, 20, 14, 28, 18, 24, 13, 30, 17, 25, 12, 22, 16, 28, 18, 24, 13, 30, 17, 25];

export function FeatureShowcase() {
  const t = useTranslations("Home.features");

  return (
    <section
      aria-label={t("sectionLabel")}
      className="border-t border-white/[0.08] bg-[#040404] py-12 sm:py-16"
    >
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-white/[0.08] bg-card/70 p-4 md:col-span-2">
          <div className="mb-3 flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <AudioWaveform className="size-4" />
          </div>
          <h2 className="text-base font-semibold">{t("conversationsTitle")}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("conversationsDescription")}
          </p>
          <div className="mt-4 space-y-2 rounded-lg border border-white/[0.07] bg-background/80 p-3">
            {(["hostTrack", "guestTrack"] as const).map((key, row) => (
              <div key={key}>
                <div className="mb-1.5 flex justify-between text-[10px]">
                  <span className={row ? "text-secondary" : "text-primary"}>{t(key)}</span>
                  <span className="text-muted-foreground">
                    {row ? "00:45 – 01:30" : "00:00 – 00:45"}
                  </span>
                </div>
                <div
                  className="flex h-8 items-center gap-1 rounded bg-muted/50 px-2"
                  aria-hidden="true"
                >
                  {waveform.map((height, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full ${row ? "bg-secondary" : "bg-primary"}`}
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="flex flex-col rounded-xl border border-white/[0.08] bg-card/70 p-4">
          <div className="mb-3 flex size-8 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary">
            <Mic2 className="size-4" />
          </div>
          <h3 className="text-sm font-semibold">{t("cloningTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("cloningDescription")}</p>
          <div className="mt-auto pt-4">
            <div className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-background/80 p-3 text-center">
              <AudioLines className="mb-2 size-5 text-secondary" />
              <span className="text-[10px] font-medium">{t("audioUpload")}</span>
              <span className="mt-1 text-[9px] text-muted-foreground">{t("audioFormats")}</span>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-white/[0.08] bg-card/70 p-4">
          <div className="mb-3 flex size-8 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <FileText className="size-4" />
          </div>
          <h3 className="text-sm font-semibold">{t("scriptsTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("scriptsDescription")}</p>
          <div className="mt-4 space-y-2 rounded-lg border border-white/[0.07] bg-background/80 p-3 font-mono text-[9px] leading-4 text-muted-foreground">
            <p>
              <span className="text-primary">{t("hostLabel")}</span> {t("scriptLineOne")}
            </p>
            <p>
              <span className="text-secondary">{t("guestLabel")}</span> {t("scriptLineTwo")}
            </p>
          </div>
        </article>

        <article className="flex flex-col rounded-xl border border-white/[0.08] bg-card/70 p-4">
          <div className="mb-3 flex size-8 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <WandSparkles className="size-4" />
          </div>
          <h3 className="text-sm font-semibold">{t("coverTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("coverDescription")}</p>
          <div className="mt-auto pt-4">
            <Image
              src="/neon_podforge.png"
              alt={t("coverAlt")}
              width={600}
              height={300}
              className="h-24 w-full rounded-md object-cover object-center"
            />
          </div>
        </article>

        <article className="flex flex-col rounded-xl border border-white/[0.08] bg-card/70 p-4">
          <div className="mb-3 flex size-8 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary">
            <BookOpenText className="size-4" />
          </div>
          <h3 className="text-sm font-semibold">{t("transcriptTitle")}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("transcriptDescription")}
          </p>
          <div className="mt-auto space-y-2 pt-4 text-[10px]">
            <div className="flex justify-between rounded border border-white/[0.07] bg-background/80 px-2 py-1.5">
              <span>00:00 {t("chapterIntro")}</span>
              <span className="text-secondary">Ch 1</span>
            </div>
            <div className="flex justify-between rounded border border-white/[0.07] bg-background/80 px-2 py-1.5">
              <span>04:12 {t("chapterShift")}</span>
              <span className="text-secondary">Ch 2</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
