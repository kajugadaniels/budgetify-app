"use client";

import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
    return (
        <div className="space-y-6">
            <div className="space-y-3 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Welcome back
                </p>
                <h2 className="text-3xl font-semibold text-foreground">
                    Sign in to Budgetify
                </h2>
                <p className="text-sm text-muted-foreground">
                    Use your Clerk account to continue building a disciplined budget.
                </p>
            </div>
            <SignIn
                routing="path"
                signUpUrl="/sign-up"
                afterSignInUrl="/dashboard"
                appearance={{
                    variables: {
                        colorPrimary: "var(--primary)",
                        colorText: "var(--foreground)",
                        colorBackground: "var(--card)",
                        colorInputBackground: "var(--input)",
                        colorInputText: "var(--foreground)",
                        borderRadius: "14px",
                        fontFamily: "var(--font-dm-sans)",
                    },
                    elements: {
                        card: "shadow-none border border-border/60 bg-transparent p-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        footerAction: "text-muted-foreground",
                        socialButtonsBlockButton:
                            "border border-border/60 bg-white text-black hover:bg-white/90",
                        formFieldInput:
                            "h-12 border-border/60 bg-input text-foreground focus:border-primary focus:ring-primary",
                        formButtonPrimary:
                            "bg-foreground text-background hover:bg-foreground/90",
                    },
                }}
            />
        </div>
    );
};

export default SignInPage;
