import type { Metadata } from "next";
import { Inter_Tight, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

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
        <Header />
        {children}
        <Footer />
        <Toaster 
          position="top-right"
          theme="light"
          richColors
        />
      </body>
    </html>
  );
}
