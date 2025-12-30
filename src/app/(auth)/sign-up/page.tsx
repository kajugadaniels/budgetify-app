"use client";

import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
    return (
        <div className="space-y-6">
            <div className="space-y-3 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Get started
                </p>
                <h2 className="text-3xl font-semibold text-white">Create your Budgetify account</h2>
                <p className="text-sm text-white/60">
                    Set up your account to start building a disciplined budget plan.
                </p>
            </div>
            <SignUp
                routing="hash"
                signInUrl="/"
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
                            "border border-border/60 bg-muted/40 text-foreground hover:bg-muted/60",
                        formFieldInput:
                            "h-12 border-border/60 bg-input text-foreground focus:border-primary focus:ring-primary",
                        formButtonPrimary:
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                    },
                }}
            />
        </div>
    );
};

export default SignUpPage;
