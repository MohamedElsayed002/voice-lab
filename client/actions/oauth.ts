type OAuthProvider = "google" | "github";

export function startOAuth(provider: OAuthProvider, locale: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const oauthUrl = new URL(`/auth/oauth/${provider}`, apiUrl)
    oauthUrl.searchParams.set("locale", locale)
    window.location.assign(oauthUrl.toString())
}


export const exchangeOAuthCode = async (code: string) => {
    if (!code) {
        return { error: true, message: "Missing OAuth exchange code" };
    }

    const response = await fetch("/api/auth/backend-oauth/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        cache: "no-store",
    });

    if (!response.ok) {
        const error: unknown = await response.json();
        return {
            error: true,
            message:
                typeof error === "object" &&
                    error !== null &&
                    "detail" in error &&
                    typeof error.detail === "string"
                    ? error.detail
                    : "OAuth exchange failed",
        };
    }

    return { ok: true };
};
