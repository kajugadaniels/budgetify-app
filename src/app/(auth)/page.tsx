"use client";

import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
    return (
        <div className="space-y-6">
            <div className="space-y-3 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Welcome back
                </p>
                <h2 className="text-3xl font-semibold text-white">Sign in to Budgetify</h2>
                <p className="text-sm text-white/60">
                    Use your Clerk account to continue building a disciplined budget.
                </p>
            </div>
            <SignIn
                routing="hash"
                signUpUrl="/#/sign-up"
                appearance={{
                    variables: {
                        colorPrimary: "#c7bfa7",
                        colorText: "#f5f0e6",
                        colorBackground: "#1a1814",
                        colorInputBackground: "#1f1c18",
                        colorInputText: "#f5f0e6",
                        borderRadius: "14px",
                        fontFamily: "var(--font-dm-sans)",
                    },
                    elements: {
                        card: "shadow-none border border-white/10 bg-transparent p-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        footerAction: "text-white/60",
                        socialButtonsBlockButton:
                            "border border-white/10 bg-white/5 text-white hover:bg-white/10",
                        formButtonPrimary:
                            "bg-[#c7bfa7] text-[#1f1a12] hover:bg-[#b8af95]",
                    },
                }}
            />
        </div>
    );
};

export default SignInPage;
