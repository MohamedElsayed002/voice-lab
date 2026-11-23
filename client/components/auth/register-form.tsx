"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Eye, EyeOff, KeyRound, Mail, UserRound } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link, useRouter } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import { useRegister } from "@/hooks/use-auth"
import { startOAuth } from "@/actions/oauth"

const registerSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80, "Name is too long."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const { mutate: mutateRegister, isPending: loadingRegister } = useRegister()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const password = useWatch({
    control: form.control,
    name: "password",
  })
  const passwordProgress = Math.min(password.length / 8, 1)

  async function handleSubmit(data: RegisterFormValues) {

    mutateRegister({
      email: data.email,
      password: data.password,
      username: data.name
    }, {
      onSuccess: () => {
        toast.success(`Check ${data.email} for a verification email, then sign in.`)
        router.replace("/verify-otp")
        router.refresh()
      }
    })

  }

  async function handleSignInWithProvider(provider: "google" | "github") {
    setPending(true)
    setError(null)

    try {
      startOAuth(provider, locale)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("requestFailed"))
      setPending(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md gap-0 border-white/[0.07] bg-[#171719] py-0 text-white shadow-2xl shadow-black/20">
      <CardHeader className="gap-1 px-6 pt-7 sm:px-8 sm:pt-8">
        <h1 className="text-center text-xl font-semibold tracking-tight">
          {t("createYourAccount")}
        </h1>
        <p className="text-center text-xs text-white/50">
          {t("registerDescription")}
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
        <Button
          className="my-5 h-10 w-full border-white/[0.06] bg-[#222225] text-xs text-white hover:bg-[#2b2b30]"
          disabled={pending}
          onClick={() => handleSignInWithProvider("google")}
          type="button"
          variant="outline"
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
        <Button
          className="mb-3 h-10 w-full border-white/[0.06] bg-[#222225] text-xs text-white hover:bg-[#2b2b30]"
          disabled={pending}
          onClick={() => handleSignInWithProvider("github")}
          type="button"
          variant="outline"
        >
          <Image
            src="/github.svg"
            alt=""
            aria-hidden="true"
            width={15}
            height={15}
          />
          {t("continueWithGitHub")}
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
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <FieldLabel
                    className="text-[10px] font-normal text-white/55"
                    htmlFor="register-name"
                  >
                    {t("name")}
                  </FieldLabel>
                  <div className="relative">
                    <UserRound
                      aria-hidden="true"
                      className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/40"
                    />
                    <Input
                      {...field}
                      id="register-name"
                      autoComplete="name"
                      placeholder={t("namePlaceholder")}
                      className="h-10 border-white/[0.05] bg-[#0d0d0f] pl-9 text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.error ? "register-name-error" : undefined
                      }
                      tabIndex={1}
                      autoFocus
                    />
                  </div>
                  {fieldState.error && (
                    <FieldError
                      id="register-name-error"
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <FieldLabel
                    className="text-[10px] font-normal text-white/55"
                    htmlFor="register-email"
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
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      placeholder="alex@company.com"
                      className="h-10 border-white/[0.05] bg-[#0d0d0f] pl-9 text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.error ? "register-email-error" : undefined
                      }
                      tabIndex={2}
                    />
                  </div>
                  {fieldState.error && (
                    <FieldError
                      id="register-email-error"
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
                  <FieldLabel
                    className="text-[10px] font-normal text-white/55"
                    htmlFor="register-password"
                  >
                    {t("password")}
                  </FieldLabel>
                  <div className="relative">
                    <KeyRound
                      aria-hidden="true"
                      className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/40"
                    />
                    <Input
                      {...field}
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="h-10 border-white/[0.05] bg-[#0d0d0f] pr-10 pl-9 text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.error
                          ? "register-password-error"
                          : "register-password-hint"
                      }
                      tabIndex={3}
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
                  <div
                    id="register-password-hint"
                    className="flex items-center gap-2"
                  >
                    <span
                      className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
                      role="progressbar"
                      aria-label={t("passwordLength")}
                      aria-valuemin={0}
                      aria-valuemax={8}
                      aria-valuenow={Math.min(password.length, 8)}
                    >
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300 transition-[width]"
                        style={{ width: `${passwordProgress * 100}%` }}
                      />
                    </span>
                    <span className="text-[9px] text-white/40">
                      {t("passwordMinimum")}
                    </span>
                  </div>
                  {fieldState.error && (
                    <FieldError
                      id="register-password-error"
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
            disabled={pending || loadingRegister}
            tabIndex={4}
          >
            {(pending || loadingRegister) ? t("working") : t("submitRegister")}
            {!(pending || loadingRegister) && <ArrowRight aria-hidden="true" className="size-3.5" />}
          </Button>
        </form>

        <p className="mt-5 text-center text-[10px] text-white/50">
          {t("alreadyHaveAccount")}{" "}
          <Link
            className="font-medium text-violet-300 hover:text-violet-200"
            href="/login"
          >
            {t("signIn")}
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
