
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { useAuthUser } from "@/hooks/use-auth"

function AuthStateBridge() {
  useAuthUser()
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthStateBridge />
      {children}
    </QueryClientProvider>
  )
}
