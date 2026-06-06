import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Diamond League | Roto Queso 2026',
  description: 'Fantasy baseball commissioner dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="diamond-bg">{children}</body>
    </html>
  )
}
