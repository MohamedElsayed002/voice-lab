
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-5 py-6 sm:px-8 lg:h-svh lg:min-h-0 lg:py-4">
      <LoginForm authError={Array.isArray(error) ? error[0] : error} />
    </main>
  )
}
