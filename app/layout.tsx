// layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Character Chat - Powered by LLMs",
  description: "Chat with your favorite AI characters using powerful Large language models.",
  keywords: "AI chat, AI characters, LLM, J.A.R.V.I.S., Ultron, Joker, Darth Vader, Kratos, Cyberpunk",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
  themeColor: "#1a1a2e",
  authors: [{ name: "AI Character Chat" }],
  openGraph: {
    title: "AI Character Chat - Powered by LLMs",
    description: "Chat with your favorite AI characters using powerful Large language models.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Script to handle mobile viewport height */}
        <Script id="viewport-height-fix" strategy="afterInteractive">
          {`
            // Fix for 100vh in mobile browsers
            function setVH() {
              let vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
            }
            window.addEventListener('resize', setVH);
            setVH();
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
