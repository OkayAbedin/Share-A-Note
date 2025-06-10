import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StructuredData from "@/components/StructuredData";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Share-A-Note - Share Notes Instantly",
    template: "%s | Share-A-Note"
  },
  description: "Create and share collaborative notes with custom URLs. No account required. Perfect for quick sharing, team collaboration, and anonymous note-taking.",
  keywords: ["notes", "sharing", "collaboration", "anonymous", "real-time", "markdown", "note taking", "collaborative editing", "instant sharing"],
  authors: [{ name: "Share-A-Note" }],
  creator: "Share-A-Note",
  publisher: "Share-A-Note",
  robots: "index, follow",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://shareanote.vercel.app'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: { url: "/apple-icon.svg", sizes: "180x180" }
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Share-A-Note - Share Notes Instantly",
    description: "Create and share collaborative notes with custom URLs. No account required. Perfect for quick sharing, team collaboration, and anonymous note-taking.",
    type: "website",
    locale: "en_US",
    url: '/',
    siteName: 'Share-A-Note',
    images: [
      {
        url: '/apple-icon.svg',
        width: 1200,
        height: 630,
        alt: 'Share-A-Note - Collaborative Note Sharing',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Share-A-Note - Share Notes Instantly",
    description: "Create and share collaborative notes with custom URLs. No account required.",
    images: ['/apple-icon.svg'],
  },
  verification: {
    google: 'google-site-verification-code-here', // Add your Google verification code
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
