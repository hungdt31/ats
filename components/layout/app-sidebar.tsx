"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/layout/logo";
import { useMe } from "@/hooks/use-me";
import { useLogout } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: currentUser } = useMe();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        setIsLogoutOpen(false);
      },
    });
  };

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

  if (currentUser?.role === "admin") {
    navItems.push({
      title: "Người dùng",
      url: "/dashboard/users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
      )
    });
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b h-16 flex justify-center p-2">
        <Link href="/dashboard" className="flex items-center gap-2 px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center font-heading text-lg font-bold tracking-tight text-foreground select-none">
          <LogoMark />
          <span className="truncate group-data-[collapsible=icon]:hidden">ATS Portal</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-2">
        {currentUser && (
          <SidebarGroup className="border-b-1">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/profile"}
                    tooltip="Hồ sơ cá nhân"
                    className="h-auto p-3 transition-all"
                  >
                    <Link href="/dashboard/profile" className="flex items-center gap-3">
                      <Avatar size="default" className="shrink-0">
                        {currentUser.avatarUrl ? (
                          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.fullName} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {currentUser.fullName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden text-left">
                        <span className="font-semibold text-foreground text-sm truncate">
                          {currentUser.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                          {currentUser.role}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
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

      <SidebarFooter className="border-t p-2">
        <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
          <DialogTrigger asChild>
            <SidebarMenuButton
              tooltip="Đăng xuất"
              className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 flex items-center justify-start gap-3 px-3 rounded-xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              <span className="group-data-[collapsible=icon]:hidden font-medium text-sm">Đăng xuất</span>
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl border-border/80 bg-background">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Xác nhận đăng xuất</DialogTitle>
              <DialogDescription className="text-xs">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống ATS Portal không?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:gap-2 pt-2 border-t border-border/30">
              <Button
                type="button"
                variant="outline"
                disabled={isLoggingOut}
                onClick={() => setIsLogoutOpen(false)}
                className="rounded-xl h-10 text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="rounded-xl h-10 text-xs font-semibold flex items-center gap-2"
              >
                {isLoggingOut && <Spinner className="size-3.5 text-destructive-foreground" />}
                Đăng xuất
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
