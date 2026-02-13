// app/layout.tsx

import type { Metadata } from "next";
import { Inter_Tight, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import SessionProvider from "@/components/Auth/SessionProvider";
import AuthGuard from "@/components/Auth/AuthGuard";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Laptop Offers",
  description: "Best Laptop Deals in Sri Lanka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={[
          interTight.variable,
          poppins.variable,
          "antialiased",
        ].join(" ")}
      >
        <SessionProvider>
          <AuthGuard>
            <Header />
            {children}
            <Footer />
          </AuthGuard>
        </SessionProvider>
        <Toaster
          position="top-right"
          theme="light"
          richColors
        />
      </body>
    </html>
  );
}