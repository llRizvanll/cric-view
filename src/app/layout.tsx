import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CricInfo Analytics - Advanced Cricket Analytics Platform",
  description: "Experience cricket like never before with comprehensive analytics, real-time insights, and beautiful visualizations powered by advanced data science.",
  keywords: "cricket, analytics, statistics, match analysis, player performance, sports data",
  authors: [{ name: "CricInfo Analytics Team" }],
  creator: "CricInfo Analytics",
  publisher: "CricInfo Analytics",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "CricInfo Analytics - Advanced Cricket Analytics Platform",
    description: "Experience cricket like never before with comprehensive analytics, real-time insights, and beautiful visualizations powered by advanced data science.",
    url: "https://cricinfo-analytics.com",
    siteName: "CricInfo Analytics",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CricInfo Analytics - Advanced Cricket Analytics Platform",
    description: "Experience cricket like never before with comprehensive analytics, real-time insights, and beautiful visualizations powered by advanced data science.",
    creator: "@cricinfoanalytics",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
