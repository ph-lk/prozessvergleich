import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prozessvergleich",
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
          <h1 className="text-center">Prozessvergleich</h1>
        </nav>
        {children}
      </body>
    </html>
  );
}
