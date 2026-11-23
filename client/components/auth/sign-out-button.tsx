"use client"


import { useLogout } from "@/hooks/use-auth"
import { useRouter } from "@/i18n/navigation"
import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

export function SignOutButton() {
  const t = useTranslations("Auth")

  const router = useRouter()
  const { mutate, isPending } = useLogout()

  async function signOut() {
    mutate(undefined, {
      onSuccess: () => {
        toast.success("User logged out successfully")
        router.push("/login")
      }
    })
  }

  return (
    <div className="flex w-full flex-col items-start gap-1">
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={signOut}
        type="button"
        disabled={isPending}
      >
        <LogOut aria-hidden="true" className="size-4 shrink-0" />
        {t("signOut")}
      </button>
    </div>
  )
}
