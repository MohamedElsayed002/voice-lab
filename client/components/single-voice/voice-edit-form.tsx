"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Voice } from "./types"

const categoryValues = [
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

const voiceCategories = categoryValues.map((value) => ({
  value,
  label: value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
}))

const supportedLanguages = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
  { label: "German", value: "de" },
]

const voiceStatuses = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
] as const

const voiceEditSchema = z.object({
  name: z.string().trim().min(1, "Enter a voice name.").max(80),
  description: z.string().trim().max(4000),
  reference_text: z.string().trim().max(4000),
  language: z.string().trim().min(1, "Choose a language."),
  category: z.enum(categoryValues),
  status: z.enum(["public", "private"]),
})

type VoiceEditValues = z.infer<typeof voiceEditSchema>

export default function VoiceEditForm({
  id,
  voice,
}: {
  id?: string
  voice: Voice
}) {
  const languages =
    supportedLanguages.some(({ value }) => value === voice.language)
      ? supportedLanguages
      : [{ label: voice.language.toUpperCase(), value: voice.language }, ...supportedLanguages]

  const form = useForm<VoiceEditValues>({
    resolver: zodResolver(voiceEditSchema),
    defaultValues: {
      name: voice.name,
      description: voice.description,
      reference_text: voice.reference_text ?? "",
      language: voice.language,
      category: voice.category,
      status: voice.status,
    },
  })

  function handleUpdate(values: VoiceEditValues) {
    console.log("Custom voice update", { voiceId: voice.id, ...values })
  }

  return (
    <section
      className="rounded-2xl border border-white/[0.08] bg-[#141419] p-6 md:p-8"
      id={id}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Voice information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Audio and avatar can’t be changed here yet.
        </p>
      </div>

      <form
        className="space-y-5"
        noValidate
        onSubmit={form.handleSubmit(handleUpdate)}
      >
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="voice-name">Name</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="voice-name"
                  placeholder="Voice name"
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
                <FieldLabel htmlFor="voice-language">Language</FieldLabel>
                <Select
                  items={languages}
                  name={field.name}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                    id="voice-language"
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder="Choose a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
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
                <FieldLabel htmlFor="voice-category">Category</FieldLabel>
                <Select
                  items={voiceCategories}
                  name={field.name}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                    id="voice-category"
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {voiceCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
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
                <FieldLabel htmlFor="voice-status">Visibility</FieldLabel>
                <Select
                  items={voiceStatuses}
                  name={field.name}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                    id="voice-status"
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

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="voice-description">Description</FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className="resize-y"
                  id="voice-description"
                  maxLength={4000}
                  rows={4}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="reference_text"
            render={({ field, fieldState }) => (
              <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="voice-reference-text">Reference text</FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className="resize-y"
                  id="voice-reference-text"
                  maxLength={4000}
                  rows={4}
                />
                <FieldDescription>
                  The text spoken in the voice sample.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex justify-end border-t border-white/[0.08] pt-5">
          <Button type="submit">Update voice</Button>
        </div>
      </form>
    </section>
  )
}
