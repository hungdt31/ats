import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserNav } from "@/components/auth/user-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Protect route
  if (!session) {
    redirect("/login");
  }

  // Ensure role is admin, hr, or interviewer
  if (session.user.role === "candidate") {
    redirect("/candidate");
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-muted/30">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span className="text-muted-foreground/30 select-none">|</span>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              Không gian quản trị & tuyển dụng
            </span>
          </div>
          <UserNav
            email={session.user.email}
            fullName={session.user.fullName}
            role={session.user.role}
          />
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
