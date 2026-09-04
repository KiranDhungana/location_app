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

const siteUrl = "https://connect-to-me.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Click me to connect me on WhatsApp",
  description: "Tap here to connect with me on WhatsApp.",
  icons: {
    icon: [{ url: "/logo.webp", type: "image/webp" }],
    shortcut: ["/logo.webp"],
    apple: [{ url: "/logo.webp", type: "image/webp" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Connect with me",
    title: "Click me to connect me on WhatsApp",
    description: "Tap here to connect with me on WhatsApp.",
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Click me to connect me on WhatsApp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Click me to connect me on WhatsApp",
    description: "Tap here to connect with me on WhatsApp.",
    images: [`${siteUrl}/og.png`],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
