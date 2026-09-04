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

function resolveSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.URL,
  ];
  for (const candidate of candidates) {
    if (candidate && !/localhost|127\.0\.0\.1/i.test(candidate)) {
      return candidate;
    }
  }
  return "https://connect-to-me.netlify.app";
}

const siteUrl = resolveSiteUrl();

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
    url: "/",
    siteName: "Connect with me",
    title: "Click me to connect me on WhatsApp",
    description: "Tap here to connect with me on WhatsApp.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Click me to connect me on WhatsApp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Click me to connect me on WhatsApp",
    description: "Tap here to connect with me on WhatsApp.",
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
