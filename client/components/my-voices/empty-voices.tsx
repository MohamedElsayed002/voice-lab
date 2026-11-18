import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Mic2 } from "lucide-react"
import { CustomVoiceDialog } from "./custom-voice-dialog"


export const EmptyVoices = () => {
    return (
        <div className="flex min-h-0 flex-1 items-center justify-center">
            <Empty className="max-w-2xl rounded-2xl border border-dashed bg-card/30 px-6 py-12 shadow-sm">
                <EmptyHeader>
                    <EmptyMedia
                        className="mb-3 size-14 rounded-2xl bg-primary/10 text-primary [&_svg:not([class*='size-'])]:size-7"
                        variant="icon"
                    >
                        <Mic2 aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle className="text-xl">
                        Your voice library is ready for its first voice
                    </EmptyTitle>
                    <EmptyDescription className="max-w-2xl">
                        Add a custom voice to make your audio feel more personal.
                        Your voices will be saved here so they are easy to find
                        for your next project.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="mt-2">
                    <CustomVoiceDialog />
                </EmptyContent>
            </Empty>
        </div>
    )
}