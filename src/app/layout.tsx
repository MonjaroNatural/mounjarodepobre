import type {Metadata} from 'next';
import './globals.css';
import { MetaPixel } from '@/components/meta-pixel';

export const metadata: Metadata = {
  title: 'Mounjaro Quiz',
  description: 'A quiz about Mounjaro, inspired by European formulas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased">
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
