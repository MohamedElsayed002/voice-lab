"use client"

import { useTranslations } from "next-intl"
import { useGetUserHistory } from "@/hooks/use-voices"

export const History = () => {
  const t = useTranslations("TextToSpeech")
  const { data, isLoading, error } = useGetUserHistory()

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">{t("historyTitle")}</h2>
      {isLoading && <p className="text-sm text-muted-foreground">{t("loadingHistory")}</p>}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {t("historyError")}
        </p>
      )}
      {!isLoading && !error && data?.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("emptyHistory")}</p>
      )}
      {data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.id} className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">{item.voice_name}</p>
              <p className="line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
                {item.text}
              </p>
              {item.audio_url && <audio className="w-full" controls preload="none" src={item.audio_url} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
