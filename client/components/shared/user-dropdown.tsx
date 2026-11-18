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
import { Avatar } from "../ui/avatar"
import { Mic, Settings, User } from "lucide-react"
import Link from "next/link"

export const UserDropdown = () => {

    const user = useAuthStore((state) => state.user)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline">
                <Avatar size="sm" />
                {user?.name}
            </Button>} />
            <DropdownMenuContent className="w-48" align="start">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                        {/* <User/> */}
                        <Link href="/settings">
                            Settings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="/my-voices">
                            My voices
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
