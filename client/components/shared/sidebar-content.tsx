"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  type LucideIcon,
  Home,
  LayoutGrid,
  AudioLines,
  Volume2,
  Settings,
  Headphones,
  Mic2,
  MessagesSquare,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  onClick?: () => void;
};

interface NavSectionProps {
  label?: string;
  items: MenuItem[];
  pathname: string;
};

function NavSection({ label, items, pathname }: NavSectionProps) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[13px] uppercase text-muted-foreground">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={item.url ? <Link href={item.url} /> : undefined}
                isActive={
                  item.url
                    ? item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url)
                    : false
                }
                onClick={item.onClick}
                tooltip={item.title}
                className="h-9 items-center gap-2 px-3 py-2 text-[13px] font-medium tracking-tight border border-transparent data-[active=true]:border-border data-[active=true]:shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]"
              >
                <item.icon aria-hidden="true" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.title}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const user = useAuthStore((state) => state.user);
  const mainMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/studio",
      icon: Home,
    },
    {
      title: "Explore voices",
      url: "/voices",
      icon: LayoutGrid,
    },
    {
      title: "Text to speech",
      url: "/text-to-speech",
      icon: AudioLines,
    },
    // {
    //   title: "Single-speaker podcast",
    //   url: '/generate-podcast-1',
    //   icon: Mic2
    // },
    {
      title: "Two-speakers podcast",
      url: '/generate-podcast-debate',
      icon: MessagesSquare
    },
    {
      title: "Voice cloning",
      icon: Volume2,
      //   onClick: () => setVoiceDialogOpen(true),
    },
  ];

  const othersMenuItems: MenuItem[] = [
    {
      title: "Settings",
      icon: Settings,
    },
    {
      title: "Help and support",
      url: "mailto:mohammadelsayed002@gmail.com",
      icon: Headphones,
    },
  ];

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex flex-col gap-4 pt-4">
          <div
            className="flex items-center gap-2 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
            <Link href="/studio">
              <Image
                src="/podforge_logo.png"
                alt="Resonance"
                width={50}
                height={50}
                className="rounded-sm cursor-pointer"
              />
            </Link>
            <span className="group-data-[collapsible=icon]:hidden font-semibold text-lg tracking-tighter text-foreground">
              PodForge
            </span>
            <SidebarTrigger className="ml-auto lg:hidden" />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>


            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <div className="border-b border-dashed border-border" />
        <SidebarContent>
          <NavSection items={mainMenuItems} pathname={pathname} />
          <NavSection
            label="Others"
            items={othersMenuItems}
            pathname={pathname}
          />
        </SidebarContent>
        <div className="border-b border-dashed border-border" />
        <SidebarFooter className="gap-3 py-3">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center">
              {/* User button */}
              <span className="flex size-8 items-center justify-center rounded-full bg-red-100 text-sm text-red-900">
                {(user?.name ?? user?.email ?? "A").charAt(0).toUpperCase()}
              </span>
              {open && <p className="hidden truncate text-sm md:block">{user?.name ?? user?.email ?? "Account"}</p>}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
