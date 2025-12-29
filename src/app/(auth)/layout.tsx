import type { ReactNode } from "react";

export default function AuthLayout({
    children,
}: Readonly<{ children: ReactNode }>) {
    return (
        <div className="min-h-screen bg-[#12110f] text-[#f5f0e6]">
            <div className="relative min-h-screen overflow-hidden">
                <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(199,191,167,0.3)_0%,_rgba(199,191,167,0)_72%)] blur-2xl" />
                <div className="pointer-events-none absolute -right-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(199,191,167,0.18)_0%,_rgba(199,191,167,0)_70%)] blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(180deg,_rgba(18,17,15,0)_0%,_rgba(18,17,15,1)_100%)]" />

                <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center">
                    <section className="flex-1 space-y-10">
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] uppercase tracking-[0.4em] text-white/70">
                            Budgetify
                            <span className="h-1 w-1 rounded-full bg-white/40" />
                            Premium Access
                        </div>
                        <div className="space-y-6">
                            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                                A refined workspace for disciplined money habits.
                            </h1>
                            <p className="max-w-xl text-base text-white/70 sm:text-lg">
                                Join a focused budgeting experience built for clarity. See your
                                spending, map your goals, and move with intention each month.
                            </p>
                        </div>
                        <div className="grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <p className="text-xs uppercase tracking-[0.28em] text-white/50">Clarity</p>
                                <p className="mt-3 text-base text-white">
                                    Real-time spend tracking with purposeful categories.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <p className="text-xs uppercase tracking-[0.28em] text-white/50">Control</p>
                                <p className="mt-3 text-base text-white">
                                    Goal-driven planning with calm monthly cadence.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.25em] text-white/45">
                            <span>Private by default</span>
                            <span>Encrypted data</span>
                            <span>Clerk secured</span>
                        </div>
                    </section>
                    <section className="flex w-full max-w-xl justify-center lg:w-[420px] lg:justify-end">
                        <div className="w-full rounded-[32px] border border-white/10 bg-[#1a1814]/90 p-8 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.8)] backdrop-blur">
                            {children}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
