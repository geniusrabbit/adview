import type { Metadata } from 'next';
import { IBM_Plex_Mono, Sora } from 'next/font/google';
import React from 'react';

import Sidebar from '@/components/Sidebar';

import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AdView Playground',
  description: 'Interactive demos for @adview/react',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${plexMono.variable}`}>
      <body
        style={
          {
            ['--font-sans' as string]: 'var(--font-sora), Sora, sans-serif',
            ['--font-mono' as string]:
              'var(--font-plex), "IBM Plex Mono", monospace',
          } as React.CSSProperties
        }
      >
        <div className="app-shell">
          <Sidebar />
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
