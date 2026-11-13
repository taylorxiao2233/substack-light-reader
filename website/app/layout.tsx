import type { Metadata } from "next";
import {headers} from 'next/headers';
import {siteConfig} from '@/lib/site-config';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: { default: 'Substack Light — A lighter way to read', template: '%s · Substack Light' },
  description: 'Give dark Substack publication pages a light reading background. A local-only Chrome extension with a clear, step-by-step manual installation guide.',
  openGraph: { title: 'Substack Light — A lighter way to read', description: 'Your favorite words, in a little more light. A small, local-only Chrome extension for supported Substack publications.', type: 'website' },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale=(await headers()).get('x-site-locale')==='zh'?'zh-CN':'en';
  return (
    <html lang={locale}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
