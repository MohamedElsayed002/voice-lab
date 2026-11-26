"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar"
import { cn } from "cn"
import { useVoiceAvatar } from "./use-voice-avatar"


interface VoiceAvatarProps {
    seed: string 
    name: string 
    avatar?: string
    className?: string
}

export function VoiceAvatar({
    seed,
    name,
    avatar,
    className
} : VoiceAvatarProps) {

    const avatarUrl = useVoiceAvatar(seed) 

    return (
        <Avatar
            className={cn("size-10 border-white/10 bg-[#24242b] shadow-xs",className)}
        >
            <AvatarImage  src={avatar ? avatar : avatarUrl} alt={name} />
            <AvatarFallback className="bg-[#24242b] text-xs font-semibold text-violet-100">
                {name.slice(0,2).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    )
}
