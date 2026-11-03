import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default async function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center px-5 py-8 sm:px-8">
      <ResetPasswordForm />
    </main>
  )
}
