"use client"

import { useLocale, useTranslations } from "next-intl"
import { DE, EG, US } from "country-flag-icons/react/3x2"
import { usePathname, useRouter } from "@/i18n/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

const locales = [
  { code: "en", Flag: US },
  { code: "de", Flag: DE },
  { code: "ar", Flag: EG },
] as const

type Locale = (typeof locales)[number]["code"]

type LocaleSwitcherProps = {
  onSwitch?: () => void
}

export function LocaleSwitcher({ onSwitch }: LocaleSwitcherProps) {
  const locale = useLocale() as Locale
  const t = useTranslations("LocaleSwitcher")
  const pathname = usePathname()
  const router = useRouter()
  const selected = locales.find((item) => item.code === locale) ?? locales[0]
  const SelectedFlag = selected.Flag

  function changeLocale(value: unknown) {
    if (typeof value !== "string" || !locales.some((item) => item.code === value)) return
    onSwitch?.()
    router.replace(pathname, { locale: value })
  }

  return (
    <Select value={locale} onValueChange={changeLocale}>
      <SelectTrigger
        aria-label={t("selectLanguage")}
        className="h-9 min-w-36 gap-2 rounded-xl border-border/70 bg-background/60 px-3 shadow-sm transition-colors hover:bg-accent"
      >
        <SelectedFlag aria-hidden="true" className="h-4 w-6 shrink-0 rounded-[2px] shadow-sm" />
        <span className="flex-1 text-start font-medium">{t(locale)}</span>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-40">
        {locales.map(({ code, Flag }) => (
          <SelectItem key={code} value={code} className="min-h-10 gap-2.5 px-2.5">
            <Flag aria-hidden="true" className="h-4 w-6 shrink-0 rounded-[2px] shadow-sm" />
            <span className="font-medium">{t(code)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
