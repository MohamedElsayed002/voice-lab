import { Suspense, type ReactNode } from "react";
import { DashboardSidebar } from "@/components/shared/sidebar-content";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

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
                <main className="flex min-h-0 flex-1 flex-col">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

async function StudioLayoutContent({ children }: { children: ReactNode }) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    return <StudioShell defaultOpen={defaultOpen}>{children}</StudioShell>;
}

export default function StudioLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<StudioShell defaultOpen>{children}</StudioShell>}>
            <StudioLayoutContent>{children}</StudioLayoutContent>
        </Suspense>
    );
}