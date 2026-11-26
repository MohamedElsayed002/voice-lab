"use client"

import { useAuthStore } from "@/store/auth.store"
import { SignOutButton } from "@/components/auth/sign-out-button"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { UserRound } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export const UserDropdown = () => {
    const t = useTranslations("UserDropdown")
    const user = useAuthStore((state) => state.user)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline">
                <Avatar className="size-8 overflow-hidden rounded-full border-2 border-background shadow-md ring-1 ring-border">
                    <AvatarImage
                        src={user?.avatar || undefined}
                        alt={t("userAvatar")}
                        className="size-full rounded-full object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.trim().charAt(0).toUpperCase() || (
                            <UserRound aria-hidden="true" className="size-7" />
                        )}
                    </AvatarFallback>
                </Avatar>
                {user?.name || user?.email}
            </Button>} />
            <DropdownMenuContent className="w-48" align="start">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
                    <DropdownMenuItem>
                        {/* <User/> */}
                        <Link href="/settings">
                            {t("settings")}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="/my-voices">
                            {t("myVoices")}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="/favorites">
                            {t("favorites")}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="/my-generation">
                            {t("generation")}
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <SignOutButton />
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
