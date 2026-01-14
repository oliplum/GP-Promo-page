import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
         <div className='grid-container'>
         {children}
        </div>
      </body>
    </html>
  );
}
