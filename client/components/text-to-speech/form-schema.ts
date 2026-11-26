import { z } from "zod"

export const textToSpeechSchema = z.object({
  text: z
    .string()
    .min(1, "Enter some text to generate speech.")
    .max(2000, "Text must be 2,000 characters or fewer.")
    .refine((value) => value.trim().length > 0, "Enter some text to generate speech."),
  voiceId: z.string().min(1, "Choose a voice."),
  // stability: z.number().int().min(1).max(10),
  exaggeration: z.float32().min(0.25).max(2.0),
  cfg_weight: z.float32().min(0.0).max(1.0),
  temperature: z.float32().min(0.05).max(2.0),
  repetition_penalty: z.float32().min(1.0).max(2.0),
  min_p: z.float32().min(0.0).max(1.0),
  top_p: z.float32().min(0.0).max(1.0),
  language: z.string()
})

export type TextToSpeechFormValues = z.infer<typeof textToSpeechSchema>
