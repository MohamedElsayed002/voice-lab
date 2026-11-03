import { useMemo} from "react"
import { createAvatar} from "@dicebear/core"
import { adventurer,bottts,pixelArt,botttsNeutral,glass } from "@dicebear/collection"

export function useVoiceAvatar(seed: string) {
    return useMemo(() => {
        return createAvatar(glass, {
            seed,
            size: 128
        }).toDataUri()
    },[seed])
}
