import { LeftSidebar } from "@/components/auth/left-side-auth"
import { auth } from "@/lib/auth/server"
import { locale as getRootLocale } from "next/root-params"
import { connection } from "next/server"
import { redirect } from "next/navigation"
import { getPathname } from "@/i18n/navigation"


export default async function AuthLayout({children} : {children: React.ReactNode}) {
    
    await connection()
    const { data: session, error } = await auth.getSession()
    if (error) throw error
    if (session?.user) {
        const locale = await getRootLocale()
        redirect(getPathname({ locale, href: "/studio" }))
    }

    return (
        <div className="min-h-svh bg-background lg:grid lg:h-svh lg:min-h-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:overflow-hidden">
            <LeftSidebar />
            <div className="flex min-h-svh items-center justify-center lg:min-h-0">
                {children}
            </div>
        </div>
    )
}
