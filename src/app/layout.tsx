import type { Metadata } from "next";
import "./globals.css";
import "./ui-improvements.css";
import ClientBody from "./ClientBody";

// Note: Google Fonts (Geist) temporarily disabled for builds without internet access
// System fonts are used as fallback. To enable Google Fonts in production:
// 1. Uncomment the import: import { Geist, Geist_Mono } from "next/font/google";
// 2. Uncomment the font configurations below
// 3. Add className to html tag: className={`${geistSans.variable} ${geistMono.variable}`}
//
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
//   fallback: ["system-ui", "-apple-system", "sans-serif"]
// });
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
//   fallback: ["ui-monospace", "monospace"]
// });

export const metadata: Metadata = {
  title: "WillFlow - Sistema de Gestão Audiovisual",
  description: "Sistema profissional de gestão de produção audiovisual. Porque criar deve ser simples.",
  applicationName: "WillFlow",
  authors: [{ name: "WillFlow Team" }],
  keywords: ["audiovisual", "produção", "gestão", "CRM", "video", "captação", "edição"],
  // PWA desativado - sistema roda apenas como website no navegador
  // manifest: "/manifest.json",
  // appleWebApp removido para evitar modo standalone
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
