
import { useTranslations } from "next-intl"

export default function RegisterPage() {
  const t = useTranslations("Auth")

  return (
    <main>
      <h1>{t("register")}</h1>
    </main>
  )
}