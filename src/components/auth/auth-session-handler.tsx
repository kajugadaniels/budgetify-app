"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

type AuthMode = "login" | "register";

type AuthSessionHandlerProps = {
    mode: AuthMode;
};

export function AuthSessionHandler({ mode }: AuthSessionHandlerProps) {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useUser();
    const hasRun = useRef(false);

    useEffect(() => {
        if (!isLoaded || !isSignedIn || hasRun.current) return;
        hasRun.current = true;

        const syncSession = async () => {
            try {
                const response = await fetch(`/api/auth/${mode}`, {
                    method: "POST",
                });
                const payload = await response.json().catch(() => null);

                if (!response.ok) {
                    toast.error(payload?.error ?? "Something went wrong.");
                    return;
                }

                toast.success(
                    payload?.message ??
                        (mode === "login"
                            ? "Welcome back."
                            : "Account verified.")
                );

                if (mode === "login") {
                    router.replace("/dashboard");
                }
            } catch (error) {
                toast.error("Unable to complete the request.");
            }
        };

        void syncSession();
    }, [isLoaded, isSignedIn, mode, router]);

    return null;
}
