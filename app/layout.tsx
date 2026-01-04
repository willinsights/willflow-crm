import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "WillFlow",
  description: "Sistema profissional de gestão de produção audiovisual",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
