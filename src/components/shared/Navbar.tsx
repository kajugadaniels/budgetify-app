"use client";

import React from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants/navigation";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const pathname = usePathname();

    return (
        <header className="border-b border-border/60 bg-card/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                        B
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Budgetify</p>
                        <p className="text-xs text-muted-foreground">Disciplined finances, calm focus.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <SignedIn>
                        <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground md:flex">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                                            isActive
                                                ? "bg-primary/10 text-foreground"
                                                : "hover:text-foreground"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "h-10 w-10",
                                    userButtonPopoverCard:
                                        "border border-border/60 bg-card/95 backdrop-blur shadow-lg",
                                },
                            }}
                        />
                    </SignedIn>
                    <SignedOut>
                        <div className="flex items-center gap-3">
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/">Login</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href="/sign-up">Register</Link>
                            </Button>
                        </div>
                    </SignedOut>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
