import type {Metadata} from 'next';
import './globals.css';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
