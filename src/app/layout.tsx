import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Elemle — Daily Periodic Table Guessing Game',
  description:
    'Elemle is a daily chemical element guessing game inspired by Wordle. Deduce the mystery element using 8 scientific attributes including atomic mass, electronegativity, and melting point.',
  keywords: [
    'periodic table game',
    'chemistry game',
    'wordle',
    'element guessing',
    'science game',
    'education',
  ],
  openGraph: {
    title: 'Elemle — Daily Periodic Table Guessing Game',
    description: 'Can you identify today\'s mystery element? Test your chemistry knowledge!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
