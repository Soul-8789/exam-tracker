// ✅ Root layout — Server Component, NO "use client"
// Only ClerkProvider + Providers + HTML shell go here
// UserButton must NOT be here — it lives in (dashboard)/layout.tsx only

import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets:  ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets:  ["latin"],
})

export const metadata: Metadata = {
  title:       "ExamTracker",
  description: "Track your SSC CGL and other exam preparation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}

// ─────────────────────────────────────────────────────────────
// WHAT GOES WHERE:
//
// src/app/layout.tsx          ← ClerkProvider, Providers, HTML only
//                                NO UserButton, NO ThemeToggle, NO hooks
//
// src/app/(dashboard)/        ← "use client" ✓ already done
//   layout.tsx                   UserButton ✓ ThemeToggle ✓ MobileNav ✓
// ─────────────────────────────────────────────────────────────