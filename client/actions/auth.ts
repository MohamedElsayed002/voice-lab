"use server"

import { api } from "@/lib/api/client";
import { cookies } from "next/headers"

const ACCESS_KEY = "voice_lab_access_token"
const REFRESH_KEY = "voice_lab_refresh_token"

type CookieStore = Awaited<ReturnType<typeof cookies>>

type AuthTokens = {
    access_token: string
    refresh_token: string
}

function setAuthCookies(cookieStore: CookieStore, tokens: AuthTokens) {
    const cookieOptions = {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
    }

    cookieStore.set(ACCESS_KEY, tokens.access_token, cookieOptions)
    cookieStore.set(REFRESH_KEY, tokens.refresh_token, cookieOptions)
}

function clearAuthCookies(cookieStore: CookieStore) {
    cookieStore.delete(ACCESS_KEY)
    cookieStore.delete(REFRESH_KEY)
}


export const login = async (email: string, password: string) => {

    const cookieStore = await cookies()

    const response = await api.POST('/auth/login', {
        body: {
            email,
            password
        }
    })
    if (!response.response.ok || response.error) {
        return { error: true, message: response.error?.detail }
    }

    setAuthCookies(cookieStore, response.data)
    return { ok: true }
}


export const register = async (email: string, password: string, username: string) => {

    const response = await api.POST("/auth/register", {
        body: {
            email,
            password,
            username
        }
    })

    if (!response.response.ok || response.error) {
        return { error: true, message: response.error?.detail }
    }

    return response.data
}


export const logout = async () => {

    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(REFRESH_KEY)?.value || ""

    const response = await api.POST('/auth/logout', {
        body: {
            refresh_token: refreshToken
        }
    })

    if (!response.response.ok || response.error) {
        return { error: true, message: response.error?.detail }
    }

    clearAuthCookies(cookieStore)

    return { message: "Logged out successfully" }
}


export const logoutAll = async () => {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_KEY)?.value || ""

    const response = await api.POST('/auth/logout-all', {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })

    if (!response.response.ok || response.error) {
        return { error: true, message: JSON.stringify(response.error) }
    }
    clearAuthCookies(cookieStore)

    return { message: "Logged out from all devices" }
}

export const getCurrentUser = async () => {
    const cookieStore = await cookies()
    let accessToken = cookieStore.get(ACCESS_KEY)?.value

    if (!accessToken) {
        return { error: true, message: "Not authenticated" }
    }

    let response = await api.GET("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (response.response.status === 401) {
        const refreshed = await refreshToken()

        if ("error" in refreshed) {
            clearAuthCookies(cookieStore)
            return { error: true, message: "Session expired" }
        }

        accessToken = cookieStore.get(ACCESS_KEY)?.value
        if (!accessToken) {
            return { error: true, message: "Session expired" }
        }

        response = await api.GET("/auth/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
    }

    if (!response.response.ok || response.error) {
        return { error: true, message: JSON.stringify(response.error) }
    }

    return response.data.user
}

export const refreshToken = async () => {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(REFRESH_KEY)?.value || ""

    const response = await api.POST("/auth/refresh", {
        body: {
            refresh_token: refreshToken
        }
    })

    if (!response.response.ok || response.error) {
        return { error: true, message: response.error?.detail }
    }

    setAuthCookies(cookieStore, response.data)
    return { ok: true }

}

