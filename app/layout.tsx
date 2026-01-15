import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import PayPalProvider from "./components/paypal-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CBTReach Winter Sale 2026",
  description: "Browse and purchase from our catalogue of world class CBT workshops",
  icons: {
    icon: '/GP globe.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PayPalProvider>
          <div className='grid-container'>
            {children}
          </div>
        </PayPalProvider>
        <Analytics />
      </body>
    </html>
  );
}
