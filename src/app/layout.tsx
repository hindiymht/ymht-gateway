import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Providers} from "./providers";
import React from "react";
import {siteConfig} from "@/config/site";
import {ThemeSwitcher} from "@/components/ThemeSwitcher";
import Image from "next/image";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: siteConfig.text.name,
    description: siteConfig.text.description,
};

export default function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased bg-background text-foreground transition-colors duration-500`}>
        <Providers>
            {/* Flex wrapper to ensure full screen height works */}
            <div className="flex flex-col min-h-screen w-full">

                {/* Global Header */}
                <header className="w-full flex justify-between items-center px-4 py-4 md:px-8 h-18">
                    {/* DBF Gateway Logo */}
                    <div className="flex items-center gap-2">
                        <Image
                            src="/assets/logo.svg"
                            alt="YMHT Logo"
                            width={24}
                            height={24}
                            className="object-contain"
                            priority
                        />
                        <span className="font-bold text-lg text-default-800">
                          {siteConfig.text.name}
                        </span>
                    </div>

                    <ThemeSwitcher/>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col w-full">
                    {children}
                </main>

                {/* Global Footer */}
                <footer className="w-full flex flex-col items-center justify-center py-6">
                    {/* GNC Logo */}
                    <Image
                        src="/assets/images/mba-logo.svg"
                        alt="MBA Logo"
                        width={70}
                        height={70}
                        className="object-contain"
                    />

                    <p className="text-sm font-bold text-default-500" style={{ color: '#0B3432' }}>{siteConfig.text.footer}</p>
                </footer>

            </div>
        </Providers>

        <Analytics />
        <SpeedInsights />
        </body>
        </html>
    );
}
