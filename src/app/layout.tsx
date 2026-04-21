import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AISEO Scanner - Is your website ready for AI search?',
  description: 'Run a full AI SEO audit and get the exact fixes to start getting cited by ChatGPT, Claude, Perplexity, and other LLMs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
