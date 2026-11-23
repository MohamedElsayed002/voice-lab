"use client"

import { login, register, logout, getCurrentUser, logoutAll } from "@/actions/auth"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useEffect } from "react"

const getErrorMessage = (
  message: string | { msg: string }[] | undefined,
  fallback: string,
) => {
  if (typeof message === "string") return message
  if (Array.isArray(message)) return message.map((error) => error.msg).join(", ")
  return fallback
}


export const useAuthUser = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)


  useEffect(() => {
    let cancelled = false 

    async function loadUser() {
      const result = await getCurrentUser()

      if(cancelled) return 

      if("error" in result) {
        clearAuth()
        return
      }

      setUser(result)
    }

    void loadUser()

    return () => {
      cancelled = true
    }
  },[clearAuth, setUser])
}

export const useSignin = () => {

  const router = useRouter()

  const { mutate, isError, isPending } = useMutation({
    mutationKey: ["login-user"],
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      const data = await login(email, password)

      if ("error" in data) {
        throw new Error(getErrorMessage(data.message, "Login failed"))
      }

      return data
    },
    onSuccess: () => {
      toast.success("User logged in successfully")
      router.replace("/studio")
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  },)

  return {
    mutate,
    isError,
    isPending
  }
}


export const useRegister = () => {
  return useMutation({
    mutationKey: ["register-user"],
    mutationFn: async ({ email, username, password }: { email: string, username: string, password: string }) => {
      const data = await register(email, password, username)

      if ("error" in data) {
        throw new Error(getErrorMessage(data.message, "Registration failed"))
      }

      return data
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}


export const useLogout = () => {
  return useMutation({
    mutationKey: ["user-logout"],
    mutationFn: logout
  })
}


export const useLogoutAllDevices = () => {
  return useMutation({
    mutationKey: ["user-logout-all-devices"],
    mutationFn: logoutAll
  })
}