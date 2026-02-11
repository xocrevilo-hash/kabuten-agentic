import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import PasswordGate from "@/components/PasswordGate";
import NavToolbar from "@/components/NavToolbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Kabuten — Agentic Stock Research",
  description:
    "AI-powered stock research platform with dedicated analyst agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${orbitron.variable} font-sans antialiased bg-white text-gray-900 kanji-wallpaper`}
      >
        <PasswordGate>
          <NavToolbar />
          {children}
        </PasswordGate>
      </body>
    </html>
  );
}
