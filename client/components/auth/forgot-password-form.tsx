"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"
import { authClient } from "@/lib/auth/client"
import { useLocale } from "next-intl"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ForgotPasswordForm() {
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setSent(false)

    try {
      const result = await authClient.forgetPassword.emailOtp({
        email: email
      })

      if (result.error) {
        setError(result.error.message || "We couldn’t send a reset link. Try again.")
        toast.error(result.error.message || "We couldn’t send a reset link. Try again.")
        return
      }
      // ${window.location.origin}${locale === "en" ? "" : `/${locale}`}/reset-password
      setSent(true)
      router.replace(`/reset-password`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t send a reset link. Try again.")
      toast.error(caught instanceof Error ? caught.message : "We couldn’t send a reset link. Try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md gap-0 border-white/[0.07] bg-[#171719] py-0 text-white shadow-2xl shadow-black/20">
      <CardHeader className="gap-1 px-6 pt-7 sm:px-8 sm:pt-8">
        <h1 className="text-center text-xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="text-center text-xs text-white/50">Enter your email and we’ll send you a password reset link.</p>
      </CardHeader>
      <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field className="gap-1.5">
            <FieldLabel className="text-[10px] font-normal text-white/55" htmlFor="forgot-password-email">Email</FieldLabel>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/40" />
              <Input
                id="forgot-password-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="alex@company.com"
                className="h-10 border-white/[0.05] bg-[#0d0d0f] pl-9 text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
              />
            </div>
          </Field>

          {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
          {sent && <p className="text-xs text-cyan-200" role="status">If an account exists for that email, a reset link has been sent.</p>}

          <Button
            className="mt-1 h-10 w-full bg-gradient-to-r from-violet-600 to-cyan-400 text-xs font-semibold text-white hover:brightness-110"
            type="submit"
            disabled={pending}
          >
            {pending ? "Sending…" : "Send reset link"}
            {!pending && <ArrowRight aria-hidden="true" className="size-3.5" />}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-white/50">
          Remember your password?{" "}
          <Link className="font-medium text-violet-300 hover:text-violet-200" href="/login">Back to log in</Link>
        </p>
      </CardContent>
    </Card>
  )
}

