import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ShareACode - Share Notes Instantly",
  description: "Create and share collaborative notes with custom URLs. No account required. Perfect for quick sharing, team collaboration, and anonymous note-taking.",
  keywords: ["notes", "sharing", "collaboration", "anonymous", "real-time", "markdown"],
  authors: [{ name: "ShareACode" }],
  creator: "ShareACode",
  publisher: "ShareACode",
  robots: "index, follow",
  openGraph: {
    title: "ShareACode - Share Notes Instantly",
    description: "Create and share collaborative notes with custom URLs. No account required.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShareACode - Share Notes Instantly",
    description: "Create and share collaborative notes with custom URLs. No account required.",
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
        {children}
      </body>
    </html>
  );
}
