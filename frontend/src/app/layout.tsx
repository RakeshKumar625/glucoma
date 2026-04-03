import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "GlaucAI — Early Glaucoma Detection",
  description: "Clinical-grade AI-powered early glaucoma screening. Upload a retinal image and get a risk report in under 2 seconds.",
  keywords: ["glaucoma", "AI", "retinal screening", "eye health", "medical AI"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
