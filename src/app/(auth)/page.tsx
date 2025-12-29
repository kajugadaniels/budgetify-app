"use client";

import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
    return (
        <div className="space-y-6">
            <div className="space-y-3 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                    Welcome back
                </p>
                <h2 className="text-3xl font-semibold text-black">Sign in to Budgetify</h2>
                <p className="text-sm text-black/60">
                    Use your Clerk account to continue building a disciplined budget.
                </p>
            </div>
            <SignIn
                routing="hash"
                appearance={{
                    variables: {
                        colorPrimary: "#c7bfa7",
                        colorText: "#201a12",
                        colorBackground: "#ffffff",
                        colorInputBackground: "#f6f2e8",
                        colorInputText: "#201a12",
                        borderRadius: "14px",
                        fontFamily: "var(--font-dm-sans)",
                    },
                    elements: {
                        card: "shadow-none border border-black/10 bg-transparent p-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        footerAction: "text-black/60",
                        socialButtonsBlockButton:
                            "border border-black/10 bg-white/80 hover:bg-white",
                        formButtonPrimary:
                            "bg-[#c7bfa7] text-[#1f1a12] hover:bg-[#b8af95]",
                    },
                }}
            />
        </div>
    );
};

export default SignInPage;
