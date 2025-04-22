import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from './AuthProvider';
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { Toaster } from "@/components/ui/sonner"
import ThemeProvider from "@/providers/ThemeProvider";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog Hub - Your Ultimate Destination for Articles and Insights",
  description:
    "Discover a collection of informative and engaging articles on a variety of topics. Stay up-to-date with the latest trends, tips, and insights in the world of blogging, technology, lifestyle, and more.",
  keywords:
    "blog, articles, insights, technology, lifestyle, trends, blogging tips, content creation, tutorials",
  authors: {
    "name": "Shehal Herath"
  },
  robots: "index, follow",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <ThemeProvider>
        <Providers session={session}>
          <Toaster />
          {children}
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
