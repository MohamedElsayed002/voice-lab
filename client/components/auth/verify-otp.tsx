"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth/client"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"

export function VerifyOTP({ email: initialEmail = "" }: { email?: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState("")
  const [pending, setPending] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const result = await authClient.emailOtp.verifyEmail({ email, otp })
      if (result.error) {
        setError(result.error.message || "We couldn't verify that code. Try again.")
        return
      }

      toast.success(`Email ${email} verified successfully`)
      router.replace("/login")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't verify that code. Try again.")
    } finally {
      setPending(false)
    }
  }

  async function handleResend() {
    const normalizedEmail = email.trim()
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address before requesting another code.")
      setNotice(null)
      return
    }

    setResending(true)
    setError(null)
    setNotice(null)

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "email-verification",
      })
      if (result.error) {
        setError(result.error.message || "We couldn’t resend the code. Try again.")
        return
      }

      setOtp("")
      toast.info("A new verification code has been sent to your email.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t resend the code. Try again.")
      toast.error(caught instanceof Error ? caught.message : "We couldn’t resend the code. Try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md gap-1 border-white/[0.07] bg-[#171719] py-0 text-white shadow-2xl shadow-black/20">
      <CardHeader className="gap-1 px-6 pt-7 sm:px-8 sm:pt-8">
        <h1 className="text-center text-xl font-semibold tracking-tight">Verify your email</h1>
        <p className="text-center text-xs text-white/50">Enter the six-digit code we sent to your email.</p>
      </CardHeader>
      <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
        <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
          <Field className="gap-1.5">
            <FieldLabel className="text-[10px] font-normal text-white/55" htmlFor="verify-email">Email</FieldLabel>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/40" />
              <Input
                id="verify-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="alex@company.com"
                className="h-10 border-white/[0.05] bg-[#0d0d0f] pl-9 text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
                tabIndex={1}
                autoFocus={true}
              />
            </div>
          </Field>

          <Field className="items-center gap-2">
            <FieldLabel className="text-[10px] font-normal text-white/55" htmlFor="verify-otp">Verification code</FieldLabel>
            <InputOTP
              id="verify-otp"
              containerClassName="justifyCenter"
              maxLength={6}
              value={otp}
              onChange={setOtp}
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Six-digit verification code"
              aria-invalid={Boolean(error)}
              disabled={pending}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    tabIndex={index + 1}
                    className="size-11 border-white/10 bg-[#0d0d0f] text-base focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </Field>

          <div className="text-xs text-white/50 -mb-3">
            Didn’t receive a code? {" "}
            <button
              className="font-medium text-violet-300 cursor-pointer hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={handleResend}
              disabled={pending || resending}
              tabIndex={8}
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          </div>

          {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
          {notice && <p className="text-center text-xs text-cyan-200" role="status">{notice}</p>}

          <Button
            className="h-10 w-full bg-gradient-to-r from-violet-600 to-cyan-400 text-xs font-semibold text-white hover:brightness-110"
            type="submit"
            disabled={pending || !email || otp.length !== 6}
            tabIndex={9}
          >
            {pending ? "Verifying" : "Verify email"}
            {!pending && <ArrowRight aria-hidden="true" className="size-3.5" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
