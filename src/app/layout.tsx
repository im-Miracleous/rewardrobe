import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReWardrobe — Pakaianmu, Harapan Mereka',
  description: 'Platform Donasi dan Daur Ulang Pakaian',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-stone-50 text-stone-800 antialiased">
        {children}
      </body>
    </html>
  );
}