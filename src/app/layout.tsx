import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./ui-improvements.css";
import ClientBody from "./ClientBody";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="pt-PT" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
