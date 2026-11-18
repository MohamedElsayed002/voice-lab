import { UserData } from "./user-data"


export const Settings = () => {
    return (
        <div className="flex min-h-0 flex-1 flex-col p-8 md:p-20">
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p>Manage your profile and workspace memberships.</p>
            <UserData />
        </div>
    )
}