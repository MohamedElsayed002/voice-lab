import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ArrowRight,
    Headphones,
    Music2,
    Play,
    RotateCcw,
    RotateCw,
    Sparkles,
    Volume2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

const waveform = [
    16, 25, 12, 32, 19, 28, 14, 34, 22, 38, 17, 26, 13, 30, 20, 36, 16, 27,
    12, 33, 22, 29, 15, 37, 19, 28, 14, 34, 21, 30, 13, 25, 18, 35, 14, 29,
]

const creators = [
    { initials: "JM", color: "bg-primary" },
    { initials: "AK", color: "bg-secondary" },
    { initials: "RL", color: "bg-primary/70" },
]

export function HeroSection() {
    const t = useTranslations("Home.hero")

    return (
        <section className="relative z-10 flex min-h-[calc(100svh-4rem)] flex-1 items-center px-5 py-10 sm:px-8 sm:py-12">
            <div className="mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-[1.2fr_0.8fr] lg:gap-16">
                <div className="max-w-2xl">
                    <Badge className="mb-5 h-6 gap-2 border border-white/10 bg-card px-3 text-[11px] text-foreground">
                        <span className="size-1.5 rounded-full bg-primary" />
                        {t("badge")}
                    </Badge>

                    <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[3.5rem]">
                        {t("title")}{" "}
                        <span className="text-primary">{t("highlight")}</span>
                    </h1>

                    <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                        {t("description")}
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Button
                            className="h-10 gap-2 px-4 bg-primary"
                            size="lg"
                            type="button"
                        //   asChild
                        >
                            <Link href="/studio">{t("createEpisode")}</Link>
                            <ArrowRight />
                        </Button>
                        <Button
                            className="h-10 gap-2 border-white/10 bg-card px-4 text-foreground hover:bg-muted"
                            size="lg"
                            type="button"
                            variant="outline"
                        >
                            <Link className="flex gap-2" href="/explore">
                                <Headphones className="text-secondary" />
                                {t("listenSample")}</Link>
                        </Button>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center pl-1" aria-label={t("creators")}>
                            {creators.map((creator, index) => (
                                <span
                                    key={creator.initials}
                                    className={`-ml-1 flex size-7 items-center justify-center rounded-full border-2 border-background text-[9px] font-semibold text-primary-foreground ${creator.color}`}
                                    style={{ zIndex: creators.length - index }}
                                >
                                    {creator.initials}
                                </span>
                            ))}
                            <span className="-ml-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-medium text-foreground">
                                +2k
                            </span>
                        </div>
                        <p>
                            <span className="font-semibold text-foreground">{t("episodeCount")}</span>{" "}
                            {t("episodesGenerated")}
                            <span className="mx-2 text-border">•</span>
                            {t("trustedBy")}
                        </p>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-md md:mx-0 md:justify-self-end">
                    <div
                        role="img"
                        aria-label={t("previewLabel")}
                        className="rounded-2xl border border-white/[0.08] bg-card/90 p-4 shadow-2xl shadow-black/30 sm:p-5"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Badge className="h-5 gap-1.5 border border-secondary/20 bg-secondary/10 px-2 text-[10px] text-secondary">
                                    <span className="size-1.5 rounded-full bg-secondary" />
                                    {t("livePreview")}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                    {t("episodeNumber", { number: 42 })}
                                </span>
                            </div>
                            <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                                <Sparkles className="size-3 text-primary" />
                                {t("renderTime")}
                            </span>
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-primary/30 via-card to-secondary/20 text-primary">
                                <Music2 className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-semibold text-foreground">
                                    {t("demoTitle")}
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Marcus ({t("host")}) <span className="mx-1 text-border">•</span>{" "}
                                    Elena ({t("guest")})
                                </p>
                            </div>
                        </div>



                        {/* TODO:  Will Replace it with WaveSurfer.js with real voice audio  */}
                        <div className="mt-4 rounded-xl border border-white/[0.06] bg-background/70 px-3 py-4">
                            <div
                                aria-hidden="true"
                                className="flex h-12 items-center justify-between"
                            >
                                {waveform.map((height, index) => (
                                    <span
                                        key={`${height}-${index}`}
                                        className={`w-[3px] rounded-full ${index % 5 === 0 || index % 7 === 0
                                            ? "bg-secondary"
                                            : index % 3 === 0
                                                ? "bg-primary"
                                                : "bg-primary"
                                            }`}
                                        style={{ height }}
                                    />
                                ))}
                            </div>
                            <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
                                <span>01:14</span>
                                <span>{t("audioQuality")}</span>
                                <span>02:34</span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <RotateCcw aria-label={t("rewind")} className="size-3.5" />
                                <span className="sr-only">{t("rewind")}</span>
                                <span
                                    aria-hidden="true"
                                    className="text-[9px] font-medium"
                                >
                                    10
                                </span>
                                <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20">
                                    <Play className="ml-0.5 size-4 fill-current" />
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="text-[9px] font-medium"
                                >
                                    10
                                </span>
                                <RotateCw aria-label={t("forward")} className="size-3.5" />
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <span className="rounded bg-muted px-1.5 py-1 text-[9px] font-medium text-foreground">
                                    1.0x
                                </span>
                                <Volume2 className="size-3.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
