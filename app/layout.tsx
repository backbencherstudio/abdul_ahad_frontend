import type { Metadata } from "next";
import "./globals.css";
import { AppConfig } from "@/config/app.config";
import { Inter, Inder, Nunito_Sans } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: AppConfig().app.name,
  description: AppConfig().app.slogan,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const inder = Inder({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inder",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${inder.variable} ${nunitoSans.variable}`}>
      <body className={inter.className}>
        <AuthProvider>
          <ToastContainer position="top-center" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
