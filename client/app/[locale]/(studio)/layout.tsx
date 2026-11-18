import { Suspense, type ReactNode } from "react";
import { DashboardSidebar } from "@/components/shared/sidebar-content";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { locale as getRootLocale } from "next/root-params";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getPathname } from "@/i18n/navigation";
import { auth } from "@/lib/auth/server";
import { UserDropdown } from "@/components/shared/user-dropdown";

function StudioShell({
    children,
    defaultOpen,
}: {
    children: ReactNode;
    defaultOpen: boolean;
}) {
    return (
        <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
            <DashboardSidebar />
            <SidebarInset className="min-h-0 min-w-0">
                <div className="flex items-start justify-between gap-4 border-b border-border p-4">
                    <SidebarTrigger />
                    <UserDropdown/>
                </div>
                <main className="flex min-h-0 flex-1 flex-col">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

async function StudioLayoutContent({ children }: { children: ReactNode }) {
    await connection();
    const { data: session, error } = await auth.getSession();
    if (error) throw error;
    if (!session?.user) {
        const locale = await getRootLocale();
        redirect(getPathname({ locale, href: "/login" }));
    }

    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    return <StudioShell defaultOpen={defaultOpen}>{children}</StudioShell>;
}

export default function StudioLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<main aria-busy="true" className="min-h-svh" />}>
            <StudioLayoutContent>{children}</StudioLayoutContent>
        </Suspense>
    );
}
