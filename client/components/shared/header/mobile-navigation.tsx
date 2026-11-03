"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { HeaderNavigationLinks } from "./header-navigation-links"
import { LocaleSwitcher } from "../locale-switcher"
import { Link } from "@/i18n/navigation"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations("Header")

  function closeMenu() {
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden">
      <Button
        aria-controls="mobile-header-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? t("closeMenu") : t("openMenu")}
        onClick={() => setIsOpen((open) => !open)}
        size="icon"
        variant="ghost"
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {isOpen && (
        <div
          className="absolute inset-x-0 top-full z-50 border-b border-border bg-background px-5 py-5 shadow-lg sm:px-8"
          id="mobile-header-navigation"
        >
          <HeaderNavigationLinks
            className="flex flex-col gap-4 text-sm text-muted-foreground"
            onNavigate={closeMenu}
          />
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <LocaleSwitcher onSwitch={closeMenu} />
            <Button className="sm:inline-flex" render={<Link href="/login" onClick={closeMenu} />} variant="ghost">
              {t("login")}
            </Button>
            <Button render={<Link href="/register" onClick={closeMenu} />} variant="secondary">{t("getStarted")}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
