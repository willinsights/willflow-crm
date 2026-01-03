"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LocaleProvider } from "@/lib/LocaleContext";
import { AppStoreProvider } from "@/lib/useAppStore";
import { CreateProjectProvider } from "@/contexts/CreateProjectContext";

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
        <AppStoreProvider>
          <CreateProjectProvider>
            <div className="antialiased">{children}</div>
          </CreateProjectProvider>
        </AppStoreProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
