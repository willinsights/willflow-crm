"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LocaleProvider } from "@/lib/LocaleContext";
import { AppStoreProvider } from "@/lib/useAppStore";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ViewProvider } from "@/lib/ViewContext";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";

    // Service Worker desativado - sistema roda como website normal
    // PWA foi desativado para garantir que o sistema funcione apenas como website
  }, []);

  return (
    <ThemeProvider>
      <LocaleProvider>
        <ViewProvider>
          <AppStoreProvider>
            <ToastProvider />
            <div className="antialiased">{children}</div>
          </AppStoreProvider>
        </ViewProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
