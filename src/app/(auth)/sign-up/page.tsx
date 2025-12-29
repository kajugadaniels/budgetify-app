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
                signInUrl="/#/"
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
                        formFieldInput:
                            "h-12 border-white/10 bg-[#1f1c18] text-white focus:border-[#c7bfa7] focus:ring-[#c7bfa7]",
                        formButtonPrimary:
                            "bg-[#c7bfa7] text-[#1f1a12] hover:bg-[#b8af95]",
                    },
                }}
            />
        </div>
    );
};

export default SignUpPage;
