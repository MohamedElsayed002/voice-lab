import { useTranslations } from "next-intl"
import { UserData } from "./user-data"


export const Settings = () => {

    const t = useTranslations("settings")

    return (
        <div className="flex min-h-0 flex-1 flex-col p-8 md:p-20">
            <h1 className="text-2xl font-semibold tracking-tight">{t("header")}</h1>
            <p>{t("description")}</p>
            <UserData />
        </div>
    )
}