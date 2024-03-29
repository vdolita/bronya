import { Toaster } from "@/sdui/ui/toaster"
import { cn } from "@/sdui/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Bronya",
  description: "Bronya license management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          "h-full bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
