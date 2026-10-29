import Image from "next/image"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { LocaleSwitcher } from "./locale-switcher"
import { Button } from "../ui/button"
import { HeaderNavigationLinks } from "./header/header-navigation-links"
import { MobileNavigation } from "./header/mobile-navigation"

export const Header = () => {
    const t = useTranslations("Header")

    return (
        <header className="relative z-30 mx-auto flex h-16 w-full max-w-7xl shrink-0 items-center justify-between border-b border-white/[0.08] px-5 sm:px-8">
            <Link href="/" className="flex items-center gap-2">
                <Image className="rounded-lg" src="/podforge_logo.png" width={40} height={40} alt="Podforge Logo" />
                <span className="font-bold">PodForge</span>
            </Link>
            <HeaderNavigationLinks className="hidden gap-6 text-sm text-muted-foreground lg:flex" />
            <div className="hidden items-center gap-2 lg:flex">
                <LocaleSwitcher />
                <Button variant="ghost">{t("login")}</Button>
                <Button variant="secondary">{t("getStarted")}</Button>
            </div>
            <MobileNavigation />
        </header>
    )
}