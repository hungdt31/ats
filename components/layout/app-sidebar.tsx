"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/layout/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Tổng quan",
      url: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
      )
    },
    {
      title: "Việc làm",
      url: "/dashboard/jobs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
      )
    },
    {
      title: "Đơn ứng tuyển",
      url: "/dashboard/applications",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
      )
    },
    {
      title: "Phỏng vấn",
      url: "/dashboard/interviews",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
      )
    },
    {
      title: "Nhật ký Email",
      url: "/dashboard/emails",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
      )
    }
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b h-16 flex justify-center p-2">
        <Link href="/dashboard" className="flex items-center gap-2 px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center font-heading text-lg font-bold tracking-tight text-foreground select-none">
          <LogoMark />
          <span className="truncate group-data-[collapsible=icon]:hidden">ATS Portal</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {/* <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Quản lý</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url} className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      )}>
                        {item.icon}
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 flex flex-col items-center justify-center">
        <div className="text-xs group-data-[collapsible=icon]:hidden text-muted-foreground/60">
          ATS v1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
