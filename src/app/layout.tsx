import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chrome Sphynx Audio | VST3 Plugins for Abstract Sound Design',
  description: 'Cutting-edge VST3 Plugins for Abstract Sound Design',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
