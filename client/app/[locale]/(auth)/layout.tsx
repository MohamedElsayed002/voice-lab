import { LeftSidebar } from "@/components/auth/left-side-auth"


async function AuthLayoutContent({ children }: { children: React.ReactNode }) {

    return (
        <div className="min-h-svh bg-background lg:grid lg:h-svh lg:min-h-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:overflow-hidden">
            <LeftSidebar />
            <div className="flex min-h-svh items-center justify-center lg:min-h-0">
                {children}
            </div>
        </div>
    )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthLayoutContent>{children}</AuthLayoutContent>
    )
}
