"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

/** Tạo QueryClient một lần duy nhất per component instance (không bị reset khi re-render). */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Không refetch khi re-focus tab trừ khi data đã stale
        refetchOnWindowFocus: false,
        // staleTime mặc định 0 — các hook tự override nếu cần
        staleTime: 0,
      },
    },
  });
}

type AppProvidersProps = {
  children: React.ReactNode;
};

import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: AppProvidersProps) {
  // useState để QueryClient không bị tạo lại mỗi lần re-render
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
      <Toaster position="bottom-right" richColors className="font-sans" />
      {/* DevTools chỉ hiển thị ở development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
