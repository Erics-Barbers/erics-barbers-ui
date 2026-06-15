import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from './components/navbar';
import Footer from './components/footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Eric's Barbers",
  description:
    "Book your next trim at Eric's Barbers in Luton with easy online appointments.",
  metadataBase: new URL('https://erics-barbers-luton.co.uk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Eric's Barbers",
    description:
      "Fresh cuts in Luton. Book your next trim at Eric's Barbers.",
    url: '/',
    siteName: "Eric's Barbers",
    locale: 'en_GB',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-black dark:bg-black dark:text-white flex flex-col`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
