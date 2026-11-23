import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Falcon Exhibition CRM — CNC Machinery Sales Platform",
  description:
    "Mobile-first sales CRM, sub-60s lead capture, dynamic WhatsApp QR magnets, and qualification platform for Falcon CNC Machinery at industrial exhibitions.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        <LanguageProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
