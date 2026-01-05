"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, ReceiptText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetRecord, BudgetTransaction, formatCurrency, monthLabels } from "./types";

type Props = {
    budget: BudgetRecord | null;
    onClose: () => void;
};

type LoadedData = {
    transactions: BudgetTransaction[];
    total: number;
};

export default function BudgetDetailsSheet({ budget, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<LoadedData>({ transactions: [], total: 0 });

    useEffect(() => {
        if (!budget) return;
        setLoading(true);
        fetch(`/api/budgets/${budget.id}/transactions`, { cache: "no-store" })
            .then((res) => res.json().catch(() => null).then((body) => ({ ok: res.ok, body })))
            .then(({ ok, body }) => {
                if (!ok) throw new Error(body?.error ?? "Unable to load transactions.");
                const txns = Array.isArray(body?.data?.transactions)
                    ? body.data.transactions
                    : [];
                const total = txns.reduce((sum: number, txn: BudgetTransaction) => sum + txn.amount, 0);
                setData({ transactions: txns, total });
            })
            .catch(() => {
                setData({ transactions: [], total: 0 });
            })
            .finally(() => setLoading(false));
    }, [budget]);

    const remaining = useMemo(() => {
        if (!budget) return 0;
        return budget.amount - (data.total || 0);
    }, [budget, data.total]);

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
                                    {data.transactions.length} record{data.transactions.length === 1 ? "" : "s"}
                                </span>
                            </div>
                            <div className="rounded-2xl border border-border/60 bg-background/60">
                                <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-primary" aria-hidden />
                                        <span className="text-sm font-semibold text-foreground">
                                            Spent {formatCurrency(data.total)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Remaining {formatCurrency(remaining)}
                                    </div>
                                </div>

                                <div className="max-h-64 space-y-2 overflow-y-auto p-4">
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                            Loading transactions...
                                        </div>
                                    ) : data.transactions.length ? (
                                        data.transactions.map((txn) => (
                                            <div
                                                key={txn.id}
                                                className="rounded-xl border border-border/60 bg-background px-3 py-2"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <ReceiptText className="h-4 w-4 text-primary" aria-hidden />
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {txn.name}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {formatCurrency(txn.amount)}
                                                    </p>
                                                </div>
                                                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                                                        <span>
                                                            {txn.date
                                                                ? new Date(txn.date).toLocaleDateString()
                                                                : "No date"}
                                                        </span>
                                                    </div>
                                                    {txn.note ? <span>{txn.note}</span> : null}
                                                </div>
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
