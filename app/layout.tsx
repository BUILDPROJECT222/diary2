import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LYRA AI",
  description: "LYRA AI - Your friendly AI assistant on Solana blockchain, launched on PumpFun",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "LYRA AI",
    description: "LYRA AI - Your friendly AI assistant on Solana blockchain",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LYRA AI",
    description: "LYRA AI - Your friendly AI assistant on Solana blockchain",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
