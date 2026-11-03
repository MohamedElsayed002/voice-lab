"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getBackendUser } from "@/actions/auth"
import { useAuthStore } from "@/store/auth.store"

export const authUserQueryKey = ["auth", "user"] as const

export function useAuthUser() {
  const query = useQuery({
    queryKey: authUserQueryKey,
    queryFn: getBackendUser,
    staleTime: 60_000,
    retry: false,
  })
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    if (query.isPending) {
      setAuth({ user: null, status: "loading", error: null })
    } else if (query.isError) {
      setAuth({ user: null, status: "error", error: query.error.message })
    } else {
      setAuth({
        user: query.data ?? null,
        status: query.data ? "authenticated" : "unauthenticated",
        error: null,
      })
    }
  }, [query.data, query.error, query.isError, query.isPending, setAuth])

  return query
}
