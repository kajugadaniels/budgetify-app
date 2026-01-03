"use client";

import type { IncomeRecord } from "./income-page-client";

type Props = {
    open: boolean;
    onClose: () => void;
    income: IncomeRecord | null;
    months: string[];
};

export default function IncomeDetailSheet({ open, onClose, income, months }: Props) {
    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/30"
                    onClick={onClose}
                    aria-hidden
                />
            )}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg transform border-l border-border/60 bg-card/95 shadow-xl backdrop-blur transition-transform duration-300 ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
                aria-hidden={!open}
            >
                <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Income</p>
                        <p className="text-xs text-muted-foreground">
                            Details and audit trail.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
                {income ? (
                    <div className="space-y-4 px-6 py-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="text-lg font-semibold text-foreground">
                                ${income.amount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Period</span>
                            <span className="text-sm font-medium text-foreground">
                                {months[(income.month || 1) - 1]} {income.year}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">Note</span>
                            <p className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground">
                                {income.note?.trim() || "No notes"}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div>
                                <p className="uppercase tracking-[0.15em]">Created</p>
                                <p className="mt-1 text-foreground">
                                    {new Date(income.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="uppercase tracking-[0.15em]">Updated</p>
                                <p className="mt-1 text-foreground">
                                    {new Date(income.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-10 text-sm text-muted-foreground">
                        No income selected.
                    </div>
                )}
            </aside>
        </>
    );
}
