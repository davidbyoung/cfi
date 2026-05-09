import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteFooter from "./_components/SiteFooter";
import SiteNav from "./_components/SiteNav";
import {
  PRIMARY_AIRPORT,
  PRIMARY_AIRPORT_LONG,
  RATE_PER_HOUR,
} from "./_content";

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
    default: `Independent CFI / CFII / MEI — Flight Instruction at ${PRIMARY_AIRPORT}`,
    template: `%s — Independent CFI at ${PRIMARY_AIRPORT}`,
  },
  description: `Independent flight instruction at ${PRIMARY_AIRPORT_LONG}. Private, instrument, commercial, multi-engine, flight reviews, and IPCs at ${RATE_PER_HOUR}.`,
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
      <body className="min-h-full flex flex-col font-sans">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
