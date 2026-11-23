import { create } from "zustand"
import type { AuthUser } from "@/lib/auth/types"


type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error"

type AuthState = {
  user: AuthUser | null 
  status: AuthStatus
   error: string | null
   setUser: (user: AuthUser | null) => void 
   setEmailNotification: (enabled: boolean) => void
   clearAuth: () => void 
}



export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  error: null,
  setUser: (user) => set({
    user,
    status: user ? "authenticated" : "unauthenticated",
    error: null
  }),
  setEmailNotification: (enabled) => set((state) => ({
    user: state.user ? { ...state.user, email_notification: enabled } : null,
  })),
  clearAuth: () => set({
    user: null,
    status: "unauthenticated",
    error: null
  })
}))