"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowRight, Eye, EyeOff, KeyRound, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { authClient } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { authUserQueryKey } from "@/hooks/use-auth"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
})

type LoginFormValues = z.infer<typeof loginSchema>

type LoginFormProps = {
  authError?: string
}

export function LoginForm({ authError }: LoginFormProps) {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(
    authError === "account_not_linked" ? t("accountNotLinked") : null,
  )
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function handleSubmit(data: LoginFormValues) {
    setPending(true)
    setError(null)

    try {
      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/",
      })

      if (response.error) {
        setError(response.error.message || t("requestFailed"))
        return
      }

      await queryClient.invalidateQueries({ queryKey: authUserQueryKey })
      router.replace("/studio")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("requestFailed"))
    } finally {
      setPending(false)
    }
  }

  async function handleSignWithGoogle() {
    setPending(true)
    setError(null)

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        newUserCallbackURL: "/studio",
        callbackURL: locale === "en" ? "/studio" : `/${locale}/studio`,
      })

      if (result.error) {
        setError(result.error.message || t("requestFailed"))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("requestFailed"))
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md gap-0 border-white/[0.07] bg-[#171719] py-0 text-white shadow-2xl shadow-black/20">
      <CardHeader className="gap-1 px-6 pt-7 sm:px-8 sm:pt-8">
        <h1 className="text-center text-xl font-semibold tracking-tight">
          {t("welcomeBack")}
        </h1>
        <p className="text-center text-xs text-white/50">{t("loginDescription")}</p>
      </CardHeader>
      <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
        <Button
          className="my-5 h-10 w-full border-white/[0.06] bg-[#222225] text-xs text-white hover:bg-[#2b2b30]"
          disabled={pending}
          onClick={handleSignWithGoogle}
          type="button"
          variant="outline"
          // tabIndex={1}
        >
          <Image
            src="/google.svg"
            alt=""
            aria-hidden="true"
            width={15}
            height={15}
          />
          {t("continueWithGoogle")}
        </Button>

        <div className="mb-5 flex items-center gap-3 text-[9px] font-medium tracking-wide text-white/40">
          <span className="h-px flex-1 bg-white/[0.08]" />
          {t("orContinueWithEmail")}
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FieldGroup className="gap-3">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <FieldLabel
                    className="text-[10px] font-normal text-white/55"
                    htmlFor="login-email"
                  >
                    {t("workEmail")}
                  </FieldLabel>
                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/40"
                    />
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      tabIndex={1}
                      autoFocus
                      placeholder="alex@company.com"
                      className="h-10 border-white/[0.05] bg-[#0d0d0f] pl-9 text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.error ? "login-email-error" : undefined
                      }
                    />
                  </div>
                  {fieldState.error && (
                    <FieldError
                      id="login-email-error"
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      className="text-[10px] font-normal text-white/55"
                      htmlFor="login-password"
                    >
                      {t("password")}
                    </FieldLabel>
                    <button
                      className="text-[9px] font-medium text-violet-300 hover:text-violet-200"
                      type="button"
                      // tabIndex={3}
                    >
                      <Link href="/forgot-password">
                        {t("forgotPassword")}
                      </Link>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound
                      aria-hidden="true"
                      className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/40"
                    />
                    <Input
                      {...field}
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      tabIndex={2}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-10 border-white/[0.05] bg-[#0d0d0f] pr-10 pl-9 text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.error ? "login-password-error" : undefined
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 inline-flex items-center justify-center px-3 text-white/40 hover:text-white/80"
                      aria-label={
                        showPassword ? t("hidePassword") : t("showPassword")
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" className="size-3.5" />
                      ) : (
                        <Eye aria-hidden="true" className="size-3.5" />
                      )}
                    </button>
                  </div>
                  {fieldState.error && (
                    <FieldError
                      id="login-password-error"
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {error && (
            <p className="text-xs text-destructive" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <Button
            className="mt-1 h-10 w-full bg-gradient-to-r from-violet-600 to-cyan-400 text-xs font-semibold text-white hover:brightness-110"
            type="submit"
            disabled={pending}
            tabIndex={3}
          >
            {pending ? t("working") : t("submitLogin")}
            {!pending && <ArrowRight aria-hidden="true" className="size-3.5" />}
          </Button>
        </form>

        <p className="mt-5 text-center text-[10px] text-white/50">
          {t("noAccount")}{" "}
          <Link className="font-medium text-violet-300 hover:text-violet-200" href="/register">
            {t("signUpFree")}
          </Link>
        </p>

        <p className="mt-4 rounded-lg border border-cyan-300/[0.08] bg-cyan-300/[0.05] px-3 py-2.5 text-center text-[9px] leading-4 text-white/50">
          <span className="font-medium text-cyan-200">{t("newAccountOffer")}</span>{" "}
          {t("newAccountDetails")}
        </p>

        <p className="mt-4 text-center text-[9px] leading-4 text-white/35">
          {t("termsAgreement")}{" "}
          <span className="text-violet-300">{t("termsOfService")}</span>{" "}
          {t("and")}{" "}
          <span className="text-violet-300">{t("privacyPolicy")}</span>.
        </p>
      </CardContent>
    </Card>
  )
}
