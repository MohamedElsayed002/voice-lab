"use client"

import { useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { exchangeOAuthCode } from "@/actions/oauth"

export default function OAuthCallbackPage() {
  const locale = useLocale()
  const t = useTranslations("Auth")
  const attempted = useRef(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    const hasError = new URLSearchParams(window.location.search).has("error")
    const params = new URLSearchParams(window.location.hash.slice(1))
    const code = params.get("code")
    window.history.replaceState(null, "", window.location.pathname)

    if (!code || hasError) {
      window.setTimeout(() => setFailed(true), 0)
      return
    }

    void (async () => {
      const result = await exchangeOAuthCode(code)
      if ("error" in result) throw new Error(result.message)

      window.location.replace(
        locale === "en" ? "/studio" : `/${locale}/studio`,
      )
    })().catch(() => setFailed(true))
  }, [locale])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p aria-live="polite" className="text-sm text-white/70" role="status">
        {failed ? t("requestFailed") : t("working")}
      </p>
      {failed && (
        <Link className="text-sm text-violet-300 hover:text-violet-200" href="/login">
          {t("submitLogin")}
        </Link>
      )}
    </main>
  )
}
