"use client";

import { CalendarDays, CreditCard, Wallet } from "lucide-react";
import TransactionActions from "./TransactionActions";
import { TransactionRecord, formatCurrency, formatDate } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

type TransactionTableProps = {
    data: TransactionRecord[];
    loading?: boolean;
    onView: (transaction: TransactionRecord) => void;
    onEdit: (transaction: TransactionRecord) => void;
    onDelete: (transaction: TransactionRecord) => void;
};

const statusTone: Record<TransactionRecord["status"], string> = {
    Cleared: "bg-primary/10 text-primary",
    Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Flagged: "bg-destructive/10 text-destructive",
};

const skeletonRows = Array.from({ length: 5 }).map((_, index) => (
    <div
        key={index}
        className="grid gap-3 px-4 py-4 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto] md:px-6 md:py-5"
    >
        <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
        <div className="flex flex-col gap-2 md:items-center">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-2 md:justify-center">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-2 md:justify-center">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-start gap-2 md:justify-center">
            <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
    </div>
));

const TransactionTable = ({
    data,
    loading = false,
    onView,
    onEdit,
    onDelete,
}: TransactionTableProps) => {
    if (loading) {
        return (
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-lg shadow-black/5">
                <div className="hidden bg-muted/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
                    <span>Merchant</span>
                    <span className="text-center">Amount</span>
                    <span className="text-center">Category</span>
                    <span className="text-center">Date</span>
                    <span className="text-center">Status</span>
                    <span className="text-right">Actions</span>
                </div>
                <div className="divide-y divide-border/70">{skeletonRows}</div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/70 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Wallet className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 text-base font-semibold text-foreground">
                    No transactions to show yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add your first transaction to see coverage and cash impact.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-lg shadow-black/5">
            <div className="hidden bg-muted/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
                <span>Merchant</span>
                <span className="text-center">Amount</span>
                <span className="text-center">Category</span>
                <span className="text-center">Date</span>
                <span className="text-center">Status</span>
                <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border/70">
                {data.map((txn) => (
                    <div
                        key={txn.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onView(txn)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onView(txn);
                            }
                        }}
                        className="group grid cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto] md:px-6 md:py-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-background text-primary shadow-inner shadow-primary/10">
                                <CreditCard className="h-5 w-5" aria-hidden />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                    {txn.merchant}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {txn.account} • {txn.method}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 md:items-center">
                            <span className="text-base font-semibold text-foreground">
                                {formatCurrency(txn.amount)}
                            </span>
                            <span className="text-xs text-muted-foreground">{txn.category}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-center">
                            <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
                            <div className="text-foreground">{formatDate(txn.date)}</div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <div className="text-foreground">{txn.method}</div>
                        </div>

                        <div className="flex items-center justify-start md:justify-center">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusTone[txn.status]}`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {txn.status}
                            </span>
                        </div>

                        <div className="flex items-center justify-end">
                            <TransactionActions
                                onView={() => onView(txn)}
                                onEdit={() => onEdit(txn)}
                                onDelete={() => onDelete(txn)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionTable;
