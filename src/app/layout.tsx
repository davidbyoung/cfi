import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SiteFooter from "./_components/SiteFooter";
import SiteNav from "./_components/SiteNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `Dave Young, CFI, CFII, MEI`,
    template: `%s | Dave Young, CFI, CFII, MEI`,
  },
  description:
    "Flight instruction from Dave Young, CFI/CFII/MEI at Chicago Executive Airport (KPWK) and DuPage Airport (KDPA). Private, instrument, commercial, and multi-engine training, plus BFRs and IPCs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
