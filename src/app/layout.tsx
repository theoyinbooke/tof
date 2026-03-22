import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
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
  metadataBase: new URL("https://theoyinbookefoundation.com"),
  title: "TheOyinbooke Foundation",
  description: "Empowering beneficiaries through education and holistic support.",
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "TheOyinbooke Foundation",
    description: "Empowering beneficiaries through education and holistic support.",
    siteName: "TheOyinbooke Foundation",
    url: "https://theoyinbookefoundation.com",
    type: "website",
    locale: "en_US",
    images: [{ url: "/logo-dark.png", width: 500, height: 500 }],
  },
  twitter: {
    card: "summary",
    title: "TheOyinbooke Foundation",
    description: "Empowering beneficiaries through education and holistic support.",
    images: ["/logo-dark.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
