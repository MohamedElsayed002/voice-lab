import {
  Apple,
  AudioLines,
  AudioWaveform,
  BrainCircuit,
  Podcast,
  Triangle,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

const companies: { name: string; icon: LucideIcon }[] = [
  { name: "OpenAI", icon: BrainCircuit },
  { name: "ElevenLabs", icon: AudioLines },
  { name: "Vercel", icon: Triangle },
  { name: "Spotify for Podcasters", icon: Podcast },
  { name: "Apple Podcasts", icon: Apple },
  { name: "Descript", icon: AudioWaveform },
]

export function TrustedCompanies() {
  const t = useTranslations("Home.trusted")

  return (
    <section
      aria-label={t("label")}
      className="w-full border-y border-white/[0.08] dark px-5 py-6 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[9px] font-semibold tracking-[0.14em] text-muted-foreground/75 sm:text-[10px]">
          {t("caption")}
        </p>

        <ul className="flex flex-wrap justify-center py-5 gap-10">
          {companies.map(({ name, icon: Icon }) => (
            <li
              key={name}
              className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold tracking-tight text-muted-foreground/70"
            >
              <Icon aria-hidden="true" className="size-[17px] shrink-0" strokeWidth={2.2} />
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
