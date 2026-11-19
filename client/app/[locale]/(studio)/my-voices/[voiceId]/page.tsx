import { SingleVoice } from "@/components/single-voice"

export default async function Page({
    params,
}: {
    params: Promise<{ locale: string; voiceId: string }>
}) {
    const { voiceId } = await params

    return (
        <SingleVoice voiceId={voiceId} />
    )
}