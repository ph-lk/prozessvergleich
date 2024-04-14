import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prozessvergleich - Nutzwertanalyse",
  description: "Prozessvergleich mit Gewichtung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <nav>
          <h1 className="text-center">Nutzwertanalyse</h1>
        </nav>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
