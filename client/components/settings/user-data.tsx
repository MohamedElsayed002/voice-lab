"use client"

import { useAuthStore } from "@/store/auth.store"
import { Button } from "../ui/button"
import Link from "next/link"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { CheckIcon, ChevronDown, InfoIcon, LogOut, UserRound } from "lucide-react"
import { Input } from "../ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { hasLocale, useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { useTranslations } from "use-intl"
import { useLogoutAllDevices } from "@/hooks/use-auth"

import { US, DE, ES, FR, IN, IT, JP, KR, NL, EG } from "country-flag-icons/react/3x2"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
    { code: "en", name: "English", Flag: US },
    { code: "de", name: "Deutsch", Flag: DE },
    { code: "ar", name: "العربية", Flag: EG},
    { code: "es", name: "Español", Flag: ES },
    { code: "fr", name: "Français", Flag: FR },
    { code: "hi", name: "हिन्दी", Flag: IN },
    { code: "it", name: "Italiano", Flag: IT },
    { code: "ja", name: "日本語", Flag: JP },
    { code: "ko", name: "한국어", Flag: KR },
    { code: "nl", name: "Nederlands", Flag: NL },
] as const

export const UserData = () => {

    const t = useTranslations("settings")

    const user = useAuthStore((state) => state.user)
    const setEmailNotification = useAuthStore((state) => state.setEmailNotification)
    const emailNotificationsEnabled = user?.email_notification ?? false
    const locale = useLocale()
    const pathname = usePathname()
    const router = useRouter()
    const selectedLanguage = languages.find((language) => language.code === locale)

    const { mutate: logoutAllDevicesMutate, isPending: logoutOutAllPending } = useLogoutAllDevices()

    const handleCheck = (checked: boolean) => {
        setEmailNotification(checked)
        console.log(checked)
    }

    const handleLanguageChange = (code: string) => {
        if (!hasLocale(routing.locales, code) || code === locale) return
        router.replace(pathname, { locale: code })
    }


    const handleLogout = () => {
        logoutAllDevicesMutate(undefined, {
            onSuccess: () => {
                router.push(`/${locale}/login`)
            }
        })
    }

    return (
        <div className="my-8 w-full divide-y divide-border last:border-b-0 border-y border-border">
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">{t("email")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {user?.email ?? t("notAvailable")}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">
                        {t("userAvatar")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {user?.name ?? t("notAvailable")}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                    <Avatar className="size-16 border-2 border-background shadow-md ring-1 ring-border">
                        <AvatarImage
                            src={user?.avatar || undefined}
                            alt={t("userAvatar")}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {user?.name?.trim().charAt(0).toUpperCase() || (
                                <UserRound aria-hidden="true" className="size-7" />
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <Dialog>
                        <DialogTrigger
                            render={
                                <Button className="shrink-0" variant="outline">
                                    {t("updateAvatar")}
                                </Button>
                            }
                        />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("updateAvatar")}</DialogTitle>
                                <DialogDescription>
                                    {t("updateAvatarDescription")}
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">
                        {t("givenName")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {user?.name ?? t("notAvailable")}
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger
                        render={
                            <Button className="shrink-0" variant="outline">
                                {t("updateGivenName")}
                            </Button>
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("updateGivenName")}</DialogTitle>
                            <DialogDescription>
                                {t("updateGivenNameDescription")}
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">{t("currentPlan")}</h2>
                    <p className="text-sm text-muted-foreground">{user?.tier[0].toUpperCase()}{user?.tier.slice(1,)}</p>
                </div>
                <Button
                    className="shrink-0"
                    render={<Link href="/subscription" />}
                    variant="outline"
                >
                    {t("manageSubscription")}
                </Button>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">{t("emailNotifications")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t("emailNotificationsDescription")}
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger
                        render={
                            <Button className="shrink-0" variant="outline">
                                {t("manage")}
                            </Button>
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("emailNotifications")}</DialogTitle>
                            <DialogDescription>
                                {t("emailNotificationsDescription")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-between gap-6 rounded-lg border p-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">{t("allNotifications")}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("allNotificationsDescription")}
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={emailNotificationsEnabled}
                                aria-label={t("emailNotificationsToggle")}
                                disabled={!user}
                                onClick={() => handleCheck(!emailNotificationsEnabled)}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${emailNotificationsEnabled ? "bg-primary" : "bg-input"
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow transition-transform ${emailNotificationsEnabled ? "translate-x-5" : "translate-x-0.5"
                                        }`}
                                />
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">{t("applicationLanguage")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {selectedLanguage?.name ?? locale}
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="flex items-center gap-2 rounded-lg border px-3 py-2"
                        render={<button type="button" />}
                    >
                        {selectedLanguage?.Flag ? <selectedLanguage.Flag className="h-4 w-4 rounded-sm" /> : null}
                        {selectedLanguage?.name}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-44 bg-zinc-900 border-zinc-800"
                    >
                        {languages.map(({ code, name, Flag }) => (
                            <DropdownMenuItem
                                key={code}
                                disabled={!hasLocale(routing.locales, code)}
                                onClick={() => handleLanguageChange(code)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Flag className="h-4 w-4 rounded-sm" />
                                <span>{name}</span>

                                {locale === code && (
                                    <CheckIcon className="ml-auto h-4 w-4" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">{t("signOutAllDevices")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t("signOutAllDevicesDescription")}
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger
                        render={
                            <Button className="shrink-0" variant="outline">
                                {t("signOut")}
                            </Button>
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <LogOut /> {t("signOutAllDevices")}
                            </DialogTitle>
                            <DialogDescription className="border rounded-md p-2">
                                <h3>{t("securityNotice")}</h3>
                                <p>{t("signOutWarning")}</p>
                            </DialogDescription>
                        </DialogHeader>
                        <p>
                            {t("signOutConfirmation")}
                        </p>
                        <DialogFooter>
                            <DialogClose className="cursor-pointer">
                                {t("cancel")}
                            </DialogClose>
                            <Button disabled={logoutOutAllPending} onClick={() => handleLogout()} className="flex gap-1  border border-red-500 text-red-500" variant="outline">
                                <LogOut />
                                {t("signOut")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className='text-sm font-bold text-red-500'>
                        {t("deleteAccount")}
                    </h2>
                    <p>
                        {t("deleteAccountDescription")}
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger
                        render={
                            <Button className="border border-red-400 text-red-400 hover:opacity-70" variant="ghost">
                                {t("deleteAccount")}
                            </Button>
                        }
                    />
                    <DialogContent className="min-w-md">
                        <DialogHeader>
                            <DialogTitle>{t("deleteAccountConfirmation")}</DialogTitle>
                            <DialogDescription>
                                <Alert className="text-red-500 border border-red-500">
                                    <InfoIcon />
                                    <AlertTitle>{t("deleteAccountWarning")}</AlertTitle>
                                    <AlertDescription className="text-red-500/80">
                                        {t("deleteAccountWarningDescription")}
                                    </AlertDescription>
                                </Alert>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <h1>{t("confirmDeleteInstruction")}</h1>
                            <Input className='' placeholder={t("emailAddressPlaceholder")} />
                        </div>
                        <DialogFooter>
                            <DialogClose>
                                <Button variant="outline">{t("cancel")}</Button>
                            </DialogClose>
                            <Button className="border border-red-500 text-red-500 hover:opacity-70" variant="ghost">{t("deleteAccountButton")}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}