"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, ReceiptText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetRecord, BudgetTransaction, formatCurrency, monthLabels } from "./types";

type Props = {
    budget: BudgetRecord | null;
    onClose: () => void;
    loading?: boolean;
};

type LoadedData = {
    budgetId: string;
    transactions: BudgetTransaction[];
    total: number;
};

export default function BudgetDetailsSheet({ budget, onClose, loading = false }: Props) {
    const [data, setData] = useState<LoadedData | null>(null);

    useEffect(() => {
        if (!budget) return;
        fetch(`/api/budgets/${budget.id}/transactions`, { cache: "no-store" })
            .then((res) => res.json().catch(() => null).then((body) => ({ ok: res.ok, body })))
            .then(({ ok, body }) => {
                if (!ok) throw new Error(body?.error ?? "Unable to load transactions.");
                const txns = Array.isArray(body?.data?.transactions)
                    ? body.data.transactions
                    : [];
                const total = txns.reduce((sum: number, txn: BudgetTransaction) => sum + txn.amount, 0);
                setData({ budgetId: budget.id, transactions: txns, total });
            })
            .catch(() => {
                setData({ budgetId: budget.id, transactions: [], total: 0 });
            });
    }, [budget]);

    const activeData = budget && data?.budgetId === budget.id ? data : null;
    const loadingTx = Boolean(budget) && !activeData;
    const transactions = activeData?.transactions ?? [];
    const totalSpent = activeData?.total ?? 0;
    const remaining = useMemo(() => {
        if (!budget) return 0;
        return budget.amount - (activeData?.total ?? 0);
    }, [activeData?.total, budget]);

    if (!budget && !loading) return null;

    if (loading) {
        return (
            <>
                <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden />
                <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg transform border-l border-border/60 bg-card/95 shadow-xl backdrop-blur transition-transform duration-300">
                    <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                        <div>
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="mt-1 h-3 w-32 rounded" />
                        </div>
                        <Skeleton className="h-9 w-16 rounded-md" />
                    </div>
                    <div className="space-y-4 px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Skeleton className="h-3 w-20 rounded" />
                                <Skeleton className="mt-2 h-6 w-40 rounded" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-background/60 p-4">
                            <Skeleton className="h-12 w-full rounded" />
                            <Skeleton className="h-12 w-full rounded" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-2xl" />
                        <div className="space-y-3">
                            <Skeleton className="h-3 w-24 rounded" />
                            <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4">
                                {[...Array(3)].map((_, idx) => (
                                    <div key={idx} className="space-y-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                                        <Skeleton className="h-4 w-32 rounded" />
                                        <Skeleton className="h-3 w-40 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </>
        );
    }

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

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Transactions
                            </p>
                                <span className="text-xs text-muted-foreground">
                                    {transactions.length} record{transactions.length === 1 ? "" : "s"}
                                </span>
                            </div>
                            <div className="rounded-2xl border border-border/60 bg-background/60">
                                <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-primary" aria-hidden />
                                        <span className="text-sm font-semibold text-foreground">
                                            Spent {formatCurrency(totalSpent)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Remaining {formatCurrency(remaining)}
                                    </div>
                                </div>

                                <div className="max-h-72 space-y-2 overflow-y-auto p-4">
                                    {loadingTx ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                            Loading transactions...
                                        </div>
                                    ) : transactions.length ? (
                                        transactions.map((txn) => (
                                            <div
                                                key={txn.id}
                                                className="rounded-xl border border-border/60 bg-background px-3 py-2"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <ReceiptText className="h-4 w-4 text-primary" aria-hidden />
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {txn.merchant ?? txn.name ?? "Transaction"}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {txn.account ?? "No account"} • {txn.method ?? "—"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {formatCurrency(txn.amount)}
                                                        </p>
                                                        <span
                                                            className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                            {txn.status ?? "Cleared"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                                                        <span>
                                                            {txn.date
                                                                ? new Date(txn.date).toLocaleDateString()
                                                                : "No date"}
                                                        </span>
                                                    </div>
                                                    {txn.category ? (
                                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                                                            {txn.category}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                {txn.note ? (
                                                    <p className="mt-1 text-xs text-muted-foreground">{txn.note}</p>
                                                ) : null}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No transactions yet.</p>
                                    )}
                                </div>
                            </div>
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
