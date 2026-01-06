import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/Providers";

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

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased dark">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
