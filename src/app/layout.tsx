import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Budgetify",
        template: "%s | Budgetify",
    },
    description:
        "Budgetify is a smart budget planner that helps you track spending, set goals, and stay on top of cash flow.",
    applicationName: "Budgetify",
    keywords: [
        "budget planner",
        "personal finance",
        "expense tracking",
        "savings goals",
        "cash flow",
    ],
    openGraph: {
        title: "Budgetify",
        description:
            "Plan, track, and optimize your budget with a clean, focused personal finance workspace.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Budgetify",
        description:
            "Plan, track, and optimize your budget with a clean, focused personal finance workspace.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <ClerkProvider>
                <body className={`${dmSans.variable} ${geistMono.variable} antialiased dark`}>
                    {children}
                </body>
            </ClerkProvider>
        </html>
    );
}
