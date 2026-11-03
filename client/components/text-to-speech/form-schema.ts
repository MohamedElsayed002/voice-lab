import { z } from "zod"

export const textToSpeechSchema = z.object({
  text: z
    .string()
    .min(1, "Enter some text to generate speech.")
    .max(2000, "Text must be 2,000 characters or fewer.")
    .refine((value) => value.trim().length > 0, "Enter some text to generate speech."),
  voiceId: z.string().min(1, "Choose a voice."),
  stability: z.number().int().min(1).max(10),
})

export type TextToSpeechFormValues = z.infer<typeof textToSpeechSchema>
