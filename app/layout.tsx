import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CV Tailor — Adapter vos candidatures",
  description:
    "Adaptez automatiquement votre CV, lettre de motivation et email à chaque offre d'emploi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b bg-card">
          <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              CV Tailor
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
