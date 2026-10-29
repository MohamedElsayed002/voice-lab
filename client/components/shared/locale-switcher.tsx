"use client"

import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "@/i18n/navigation"
import { Languages } from "lucide-react"

type LocaleSwitcherProps = {
  onSwitch?: () => void
}

export function LocaleSwitcher({ onSwitch }: LocaleSwitcherProps) {
  const locale = useLocale()
  const t = useTranslations("LocaleSwitcher")
  const pathname = usePathname()
  const router = useRouter()
  const nextLocale = locale === "en" ? "de" : "en"
  const languageLabel = t(nextLocale)
  const flag = nextLocale === "de" ? "🇩🇪" : "🇺🇸"

  return (
    <Button
      aria-label={t("switchLanguage", { locale: languageLabel })}
      onClick={() => {
        onSwitch?.()
        router.replace(pathname, { locale: nextLocale })
      }}
      type="button"
      variant="ghost"
    >
      <Languages aria-hidden="true" />
      <span aria-hidden="true">{flag}</span>
      <span>{languageLabel}</span>
    </Button>
  )
}
