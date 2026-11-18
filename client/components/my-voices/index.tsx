import { EmptyVoices } from "./empty-voices"


export const MyVoices = () => {
    return (
        <div className="flex min-h-0 flex-1 flex-col p-6">
            <h1 className="text-2xl font-semibold tracking-tight">My Voices</h1>
            <EmptyVoices />
        </div>
    )
}