"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Mic, Upload, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { useCreateVoice } from "@/hooks/use-voices"
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
import { RecordTab } from "./record-tab"
import { UploadTab } from "./upload-tab"

const languages = [
    { label: "English", value: "en" },
    { label: "Arabic", value: "ar" },
    { label: "German", value: "de" },
]

const voiceStatuses = [
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
] as const

const voiceCategoryValues = [
    "audiobook",
    "conversational",
    "customer_support",
    "general",
    "narrative",
    "characters",
    "meditation",
    "motivational",
    "podcast",
    "advertising",
    "voiceover",
    "corporate",
] as const

const voiceCategories = voiceCategoryValues.map((value) => ({
    value,
    label: value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
}))

const allowedWavTypes = new Set([
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "application/octet-stream",
])

const customVoiceFormSchema = z.object({
    referenceText: z
        .string()
        .trim()
        .min(1, "Enter the text spoken in the sample.")
        .max(4000, "Reference text must be 4000 characters or fewer."),
    name: z.string().trim().min(1, "Enter a voice name.").max(80, "Name must be 80 characters or fewer."),
    description: z.string().trim().max(4000, "Description must be 4000 characters or fewer."),
    language: z.enum(["en", "ar", "de"], "Choose a language."),
    category: z.enum(voiceCategoryValues, "Choose a voice category."),
    status: z.enum(["public", "private"]),
    avatar: z
        .file()
        .max(5 * 1024 * 1024, "Image must be 5 MB or smaller.")
        .mime(["image/png", "image/jpeg", "image/webp"], "Upload a PNG, JPG, or WebP image.")
        .optional(),
    file: z
        .instanceof(File, { message: "An audio file is required" })
        .nullable()
        .refine(
            (file) =>
                file === null ||
                (file.name.toLowerCase().endsWith(".wav") && allowedWavTypes.has(file.type)),
            "Choose a WAV audio file.",
        )
        .refine(
            (file) => file === null || file.size <= 25 * 1024 * 1024,
            "Audio file must be 25 MB or smaller.",
        )
        .refine((f) => f !== null, "An audio file is required"),
})

type CustomVoiceFormInput = z.input<typeof customVoiceFormSchema>
type CustomVoiceFormValues = z.output<typeof customVoiceFormSchema>

export function CustomVoiceForm({ onSuccess }: { onSuccess?: () => void }) {
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
    const createVoiceMutation = useCreateVoice()
    const form = useForm<CustomVoiceFormInput, unknown, CustomVoiceFormValues>({
        resolver: zodResolver(customVoiceFormSchema),
        defaultValues: {
            referenceText: "",
            name: "",
            description: "",
            language: "en",
            category: "general",
            status: "private",
            avatar: undefined,
            file: null,
        },
    })

    useEffect(() => {
        if (!avatarPreviewUrl) return

        return () => {
            URL.revokeObjectURL(avatarPreviewUrl)
        }
    }, [avatarPreviewUrl])

    function handleSubmit(values: CustomVoiceFormValues) {
        const formData = new FormData()
        formData.set("name", values.name)
        formData.set("description", values.description)
        formData.set("language", values.language)
        formData.set("category", values.category)
        formData.set("status", values.status)
        formData.set("reference_text", values.referenceText)
        formData.set("audio", values.file)
        if (values.avatar) formData.set("avatar", values.avatar)

        createVoiceMutation.mutate(formData, {
            onSuccess: () => {
                toast.success("Voice created successfully.")
                form.reset()
                setAvatarPreviewUrl(null)
                onSuccess?.()
            },
            onError: (error) => {
                toast.error(error instanceof Error ? error.message : "Could not create voice.")
            },
        })
    }

    return (
        <form
            className="space-y-5"
            noValidate
            onSubmit={form.handleSubmit(handleSubmit)}
        >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-4">
                    <Controller
                        control={form.control}
                        name="file"
                        render={({ field, fieldState }) => (
                            <div className="space-y-2">
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
                                        <UploadTab
                                            file={field.value}
                                            isInvalid={fieldState.invalid}
                                            onFileChange={field.onChange}
                                        />
                                    </TabsContent>
                                    <TabsContent className="mt-4" value="record">
                                        <RecordTab
                                            file={field.value}
                                            isInvalid={fieldState.invalid}
                                            onFileChange={field.onChange}
                                        />
                                    </TabsContent>
                                </Tabs>
                                <FieldError errors={[fieldState.error]} />
                            </div>
                        )}
                    />
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

                <FieldGroup className="gap-3 -mt-14">
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
                                            src={avatarPreviewUrl ?? undefined}
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
                                                event.target.value = ""
                                                field.onChange(file)
                                                setAvatarPreviewUrl(file ? URL.createObjectURL(file) : null)
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
                        name="category"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="custom-voice-category">Category</FieldLabel>
                                <Select
                                    items={voiceCategories}
                                    name={field.name}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        aria-invalid={fieldState.invalid}
                                        className="w-full"
                                        id="custom-voice-category"
                                        onBlur={field.onBlur}
                                    >
                                        <SelectValue placeholder="Choose a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {voiceCategories.map((category) => (
                                                <SelectItem
                                                    key={category.value}
                                                    value={category.value}
                                                >
                                                    {category.label}
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
                <Button disabled={createVoiceMutation.isPending} type="submit">
                    {createVoiceMutation.isPending ? "Saving..." : "Save voice"}
                </Button>
            </DialogFooter>
        </form>
    )
}
