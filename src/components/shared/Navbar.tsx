import React from "react";
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
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
            </div>
        </header>
    );
};

export default Navbar;
