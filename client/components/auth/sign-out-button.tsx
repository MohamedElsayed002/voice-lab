"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth/client"
import { useQueryClient } from "@tanstack/react-query"
import { authUserQueryKey } from "@/hooks/use-auth"
import { useAuthStore } from "@/store/auth.store"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const t = useTranslations("Auth")
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)

  async function signOut() {
    setError(null)

    try {
      const result = await authClient.signOut()
      if (result.error) {
        setError(result.error.message || t("requestFailed"))
        return
      }

      queryClient.setQueryData(authUserQueryKey, null)
      setAuth({ user: null, status: "unauthenticated", error: null })
      router.replace("/login")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("requestFailed"))
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-1">
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={signOut}
        type="button"
      >
        <LogOut aria-hidden="true" className="size-4 shrink-0" />
        {t("signOut")}
      </button>
      {error && (
        <p aria-live="polite" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
