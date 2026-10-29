import { HeroSection } from "@/components/home/hero-section"
import { Process } from "@/components/home/process"
import { TrustedCompanies } from "@/components/home/trusted"
import { Header } from "@/components/shared/header"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Home.metadata")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function App() {
  return (
    <main>
      <div className="relative isolate flex min-h-svh flex-col overflow-hidden">
        <iframe
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full border-0"
          loading="eager"
          src="/shader.html"
          title="Animated studio background"
          tabIndex={-1}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-background/20"
        />
        <Header />
        <HeroSection />
      </div>
      <TrustedCompanies />
      <Process />
    </main>
  )
}