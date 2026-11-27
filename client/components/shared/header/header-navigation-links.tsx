import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

const navigationLinks = [
  { href: "/features", label: "features" },
  { href: "/how-it-works", label: "workflow" },
  { href: "/audio-demo", label: "audioDemo" },
  { href: "/subscription", label: "subscription" },
  { href: "/faq", label: "faq" },
] as const

type HeaderNavigationLinksProps = {
  className: string
  onNavigate?: () => void
}

export function HeaderNavigationLinks({
  className,
  onNavigate,
}: HeaderNavigationLinksProps) {
  const t = useTranslations("Header")

  return (
    <nav aria-label={t("primaryNavigation")}>
      <ul className={className}>
        {navigationLinks.map(({ href, label }) => (
          <li key={href}>
            <Link
              className="transition-colors hover:text-primary"
              href={href}
              onClick={onNavigate}
            >
              {t(label)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
