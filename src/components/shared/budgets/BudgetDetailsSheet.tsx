"use client";

import { Button } from "@/components/ui/button";
import { BudgetRecord, formatCurrency, monthLabels } from "./types";

type Props = {
    budget: BudgetRecord | null;
    onClose: () => void;
};

export default function BudgetDetailsSheet({ budget, onClose }: Props) {
    return (
        <>
            {budget && (
                <div
                    className="fixed inset-0 z-40 bg-black/30"
                    onClick={onClose}
                    aria-hidden
                />
            )}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg transform border-l border-border/60 bg-card/95 shadow-xl backdrop-blur transition-transform duration-300 ${
                    budget ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Budget</p>
                        <p className="text-xs text-muted-foreground">
                            Allocation details and activity.
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
                {budget ? (
                    <div className="space-y-4 px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Budget
                                </p>
                                <p className="text-xl font-semibold text-foreground">
                                    {budget.name}
                                </p>
                            </div>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {budget.category || "General"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-background/60 p-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Planned
                                </p>
                                <p className="text-lg font-semibold text-foreground">
                                    {formatCurrency(budget.amount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Spent
                                </p>
                                <p className="text-lg font-semibold text-foreground">
                                    {formatCurrency(budget.spent)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Remaining
                                </p>
                                <p className="text-lg font-semibold text-foreground">
                                    {formatCurrency(budget.amount - budget.spent)}
                                </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {monthLabels[(budget.month || 1) - 1]} {budget.year}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Notes
                            </p>
                            <p className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground">
                                {budget.note?.trim() || "No notes provided."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-10 text-sm text-muted-foreground">
                        No budget selected.
                    </div>
                )}
            </aside>
        </>
    );
}
