import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Script from "next/script";
import { TrpcProvider } from "@/components/providers/TrpcProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Divine View",
  description: "Create, edit, and preview Path of Exile 2 item filters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <Script
          defer
          src={process.env.UMAMI_SRC!}
          data-website-id={process.env.UMAMI_ID!}
          strategy="afterInteractive"
        />
      </head>
      <body>
        <TrpcProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
