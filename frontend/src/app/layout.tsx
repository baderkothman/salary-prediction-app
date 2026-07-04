import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalaryLens AI — Know what a job should pay",
  description:
    "Get an instant salary estimate for any tech job, based on real market data. Compare roles, experience levels, and locations in seconds.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body suppressHydrationWarning>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
