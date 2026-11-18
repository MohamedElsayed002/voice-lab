"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Mic, Upload, UserRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const languages = [
    { label: "English", value: "en" },
    { label: "Arabic", value: "ar" },
    { label: "German", value: "de" },
]

const voiceStatuses = [
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
] as const

const customVoiceFormSchema = z.object({
    referenceText: z.string().trim().min(1, "Enter the text spoken in the sample."),
    name: z.string().trim().min(1, "Enter a voice name.").max(80, "Name must be 80 characters or fewer."),
    description: z.string().trim().max(4000, "Description must be 4000 characters or fewer."),
    language: z.enum(["en", "ar", "de"], "Choose a language."),
    status: z.enum(["public", "private"]),
    avatar: z
        .file()
        .max(5 * 1024 * 1024, "Image must be 5 MB or smaller.")
        .mime(["image/png", "image/jpeg", "image/webp"], "Upload a PNG, JPG, or WebP image.")
        .optional(),
})

type CustomVoiceFormValues = z.infer<typeof customVoiceFormSchema>

export function CustomVoiceForm() {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const avatarPreviewUrl = useRef<string | null>(null)
    const form = useForm<CustomVoiceFormValues>({
        resolver: zodResolver(customVoiceFormSchema),
        defaultValues: {
            referenceText: "",
            name: "",
            description: "",
            language: "en",
            status: "private",
            avatar: undefined,
        },
    })

    useEffect(() => {
        return () => {
            if (avatarPreviewUrl.current) {
                URL.revokeObjectURL(avatarPreviewUrl.current)
            }
        }
    }, [])

    function handleSubmit(values: CustomVoiceFormValues) {
        console.log("Custom voice form values:", values)
    }

    return (
        <form
            className="space-y-5"
            noValidate
            onSubmit={form.handleSubmit(handleSubmit)}
        >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-4">
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid h-auto w-full grid-cols-2">
                            <TabsTrigger className="gap-2 focus-visible:ring-inset" value="upload">
                                <Upload aria-hidden="true" />
                                Upload audio
                            </TabsTrigger>
                            <TabsTrigger className="gap-2 focus-visible:ring-inset" value="record">
                                <Mic aria-hidden="true" />
                                Record audio
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent className="mt-4" value="upload">
                            <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Upload aria-hidden="true" className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Upload a voice sample</p>
                                    <p className="max-w-xs text-sm text-muted-foreground">
                                        Add a clear recording with minimal background noise.
                                    </p>
                                </div>
                                <Button className="mt-1 gap-2" disabled type="button" variant="outline">
                                    <Upload aria-hidden="true" />
                                    Choose audio file
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    File upload is coming soon
                                </p>
                            </div>
                        </TabsContent>
                        <TabsContent className="mt-4" value="record">
                            <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Mic aria-hidden="true" className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Record a voice sample</p>
                                    <p className="max-w-xs text-sm text-muted-foreground">
                                        Record a short, natural speech sample directly from your microphone.
                                    </p>
                                </div>
                                <Button className="mt-1 gap-2" disabled type="button" variant="outline">
                                    <Mic aria-hidden="true" />
                                    Start recording
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Recording is coming soon
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <FieldGroup>
                        <Controller
                            control={form.control}
                            name="referenceText"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="custom-voice-reference-text">
                                        Reference text
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        id="custom-voice-reference-text"
                                        placeholder="Enter the exact text spoken in the audio."
                                        rows={4}
                                        className="resize-none"
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </div>

                <FieldGroup className="gap-4">
                    <Controller
                        control={form.control}
                        name="avatar"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="custom-voice-avatar">
                                    Character avatar
                                </FieldLabel>
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-16">
                                        <AvatarImage
                                            alt="Selected voice avatar"
                                            src={avatarPreview ?? undefined}
                                        />
                                        <AvatarFallback>
                                            <UserRound aria-hidden="true" className="size-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Input
                                            accept="image/png,image/jpeg,image/webp"
                                            aria-invalid={fieldState.invalid}
                                            id="custom-voice-avatar"
                                            name={field.name}
                                            onBlur={field.onBlur}
                                            onChange={(event) => {
                                                const file = event.target.files?.[0]
                                                field.onChange(file)

                                                if (avatarPreviewUrl.current) {
                                                    URL.revokeObjectURL(avatarPreviewUrl.current)
                                                }

                                                avatarPreviewUrl.current = file
                                                    ? URL.createObjectURL(file)
                                                    : null
                                                setAvatarPreview(avatarPreviewUrl.current)
                                            }}
                                            ref={field.ref}
                                            type="file"
                                        />
                                        <FieldDescription>
                                            PNG, JPG, or WebP. Maximum size: 5 MB.
                                        </FieldDescription>
                                    </div>
                                </div>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="name"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="custom-voice-name">Name</FieldLabel>
                                <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    id="custom-voice-name"
                                    placeholder="Voice name"
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="custom-voice-description">
                                    Description <span className="font-normal text-muted-foreground">(optional)</span>
                                </FieldLabel>
                                <Textarea
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    id="custom-voice-description"
                                    placeholder="Describe this voice"
                                    className="resize-none"
                                    rows={3}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="language"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="custom-voice-language">Language</FieldLabel>
                                <Select
                                    items={languages}
                                    name={field.name}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        aria-invalid={fieldState.invalid}
                                        className="w-full"
                                        id="custom-voice-language"
                                        onBlur={field.onBlur}
                                    >
                                        <SelectValue placeholder="Choose a language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {languages.map((language) => (
                                                <SelectItem
                                                    key={language.value}
                                                    value={language.value}
                                                >
                                                    {language.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="status"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="custom-voice-status">Visibility</FieldLabel>
                                <Select
                                    items={voiceStatuses}
                                    name={field.name}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        aria-invalid={fieldState.invalid}
                                        className="w-full"
                                        id="custom-voice-status"
                                        onBlur={field.onBlur}
                                    >
                                        <SelectValue placeholder="Choose visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {voiceStatuses.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />
                </FieldGroup>
            </div>

            <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>
                    Cancel
                </DialogClose>
                <Button type="submit">Save voice</Button>
            </DialogFooter>
        </form>
    )
}
