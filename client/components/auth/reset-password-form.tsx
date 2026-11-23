"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowRight, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Enter the reset token from your email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: "", password: "", confirmPassword: "" },
  })

  async function handleSubmit(values: ResetPasswordValues) {
    console.log(values)
  }

  return (
    <Card className="w-full max-w-md gap-0 border-white/[0.07] bg-[#171719] py-0 text-white shadow-2xl shadow-black/20">
      <CardHeader className="gap-1 px-6 pt-7 sm:px-8 sm:pt-8">
        <h1 className="text-center text-xl font-semibold tracking-tight">Set a new password</h1>
        <p className="text-center text-xs text-white/50">Enter the reset token from your email and choose a new password.</p>
      </CardHeader>
      <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
        <form className="mt-6 flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
          <Controller
            name="token"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1.5">
                <FieldLabel className="text-[10px] font-normal text-white/55" htmlFor="reset-token">Reset token</FieldLabel>
                <Input
                  {...field}
                  id="reset-token"
                  type="text"
                  autoComplete="one-time-code"
                  placeholder="Paste the token from your email"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? "reset-token-error" : undefined}
                  className="h-10 border-white/[0.05] bg-[#0d0d0f] text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
                />
                {fieldState.error && <FieldError id="reset-token-error" errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1.5">
                <FieldLabel className="text-[10px] font-normal text-white/55" htmlFor="new-password">New password</FieldLabel>
                <div className="relative">
                  <KeyRound aria-hidden="true" className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/40" />
                  <Input
                    {...field}
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.error ? "new-password-error" : undefined}
                    className="h-10 border-white/[0.05] bg-[#0d0d0f] pl-9 text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
                  />
                </div>
                {fieldState.error && <FieldError id="new-password-error" errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1.5">
                <FieldLabel className="text-[10px] font-normal text-white/55" htmlFor="confirm-password">Confirm new password</FieldLabel>
                <div className="relative">
                  <KeyRound aria-hidden="true" className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/40" />
                  <Input
                    {...field}
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.error ? "confirm-password-error" : undefined}
                    className="h-10 border-white/[0.05] bg-[#0d0d0f] pl-9 text-xs placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/20"
                  />
                </div>
                {fieldState.error && <FieldError id="confirm-password-error" errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* {error && <p className="text-xs text-destructive" role="alert"></p>} */}

          <Button
            className="mt-1 h-10 w-full bg-gradient-to-r from-violet-600 to-cyan-400 text-xs font-semibold text-white hover:brightness-110"
            type="submit"
            disabled={true}
          >
            {false ? "Updating..." : "Update password"}
            {!true && <ArrowRight aria-hidden="true" className="size-3.5" />}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-white/50">
          Need a reset link?{" "}
          <Link className="font-medium text-violet-300 hover:text-violet-200" href="/forgot-password">Request one here</Link>
        </p>
      </CardContent>
    </Card>
  )
}
