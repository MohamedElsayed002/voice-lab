import { TextToSpeech } from "@/components/text-to-speech";

type TextToSpeechPageProps = {
    searchParams: Promise<{ voiceId?: string | string[] }>
}

export default async function TextToSpeechPage({ searchParams }: TextToSpeechPageProps) {
    const voiceIdParam = (await searchParams).voiceId
    const voiceId = typeof voiceIdParam === "string" ? voiceIdParam : undefined

    return (
       <TextToSpeech key={voiceId ?? "no-voice"} voiceId={voiceId}/>
    )
}