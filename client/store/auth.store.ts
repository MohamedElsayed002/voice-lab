import { create } from "zustand"
import type { AuthUser } from "@/lib/auth/types"

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error"

type AuthState = {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  setAuth: (state: Pick<AuthState, "user" | "status" | "error">) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  error: null,
  setAuth: (state) => set(state),
}))
