
import { useTranslations } from "next-intl"

export default function StudioPage() {
  const t = useTranslations("Studio")
  // const data = await api
  return (
    <main className="min-h-screen grid place-items-center">
      <h1 className="text-8xl font-bold">{t("title")}</h1>
    </main>
  )
}