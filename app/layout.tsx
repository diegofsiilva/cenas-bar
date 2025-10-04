import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { LicenseProvider } from "@/components/license-provider"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Sistema de Gestão - Bar/Bistrô",
  description: "Sistema completo de gestão para bares e bistrôs",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <LicenseProvider>{children}</LicenseProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
