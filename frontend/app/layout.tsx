import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Stylus Coinflip",
  description: "Feeling lucky?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="flex flex-col h-screen mx-auto">
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
