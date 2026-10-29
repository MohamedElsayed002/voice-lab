import { useTranslations } from "next-intl"

export default function ExplorePage() {
  const t = useTranslations("Explore")

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </main>
  )
}