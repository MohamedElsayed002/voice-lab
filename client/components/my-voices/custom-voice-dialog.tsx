"use client"

import { AudioLines, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CustomVoiceForm } from "./custom-voice-form"

export const CustomVoiceDialog = () => {
    return (
        <Dialog>
            <DialogTrigger
                render={
                    <Button className="gap-2">
                        <Plus aria-hidden="true" className="size-4" />
                        Add a custom voice
                    </Button>
                }
            />
            <DialogContent className="md:min-w-4xl">
                <DialogHeader>
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <AudioLines aria-hidden="true" className="size-5" />
                    </div>
                    <DialogTitle>Add a custom voice</DialogTitle>
                    <DialogDescription>
                        Create a new voice profile with an audio sample to clone the voice.
                    </DialogDescription>
                </DialogHeader>
                <CustomVoiceForm />
            </DialogContent>
        </Dialog>
    )
}
