"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

export default function SignOutPage() {
    const { signOut } = useClerk();

    useEffect(() => {
        void signOut({ redirectUrl: "/" });
    }, [signOut]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <div className="rounded-2xl border border-border/60 bg-card/80 px-6 py-4 shadow-sm backdrop-blur">
                Signing you out…
            </div>
        </div>
    );
}
