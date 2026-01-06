"use client";

import { CalendarCheck, CalendarClock, CreditCard, Wallet } from "lucide-react";
import IncomeActions from "./IncomeActions";
import { IncomeRecord, formatCurrency, formatDate } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

type IncomeTableProps = {
    data: IncomeRecord[];
    loading?: boolean;
    onView: (income: IncomeRecord) => void;
    onEdit: (income: IncomeRecord) => void;
    onDelete: (income: IncomeRecord) => void;
};

const recurrenceTone: Record<IncomeRecord["recurrence"], string> = {
    Recurring: "bg-primary/10 text-primary",
    "One-time": "bg-foreground/10 text-foreground",
};

const skeletonRows = Array.from({ length: 4 }).map((_, index) => (
    <div
        key={index}
        className="grid gap-3 px-4 py-4 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto] md:px-6 md:py-5"
    >
        <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
        <div className="flex items-center justify-between md:justify-center">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center justify-start gap-2 md:justify-center">
            <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center justify-start gap-2 md:justify-center">
            <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-start gap-2 md:justify-center">
            <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
    </div>
));

const IncomeTable = ({ data, loading = false, onView, onEdit, onDelete }: IncomeTableProps) => {
    if (loading) {
        return (
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-lg shadow-black/5">
                <div className="hidden bg-muted/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
                    <span>Source</span>
                    <span className="text-center">Amount</span>
                    <span className="text-center">Cadence</span>
                    <span className="text-center">Paid on</span>
                    <span className="text-center">Next payout</span>
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
                    No incomes to show yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add your first income stream to start tracking inflows and coverage.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-lg shadow-black/5">
            <div className="hidden bg-muted/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
                <span>Source</span>
                <span className="text-center">Amount</span>
                <span className="text-center">Cadence</span>
                <span className="text-center">Paid on</span>
                <span className="text-center">Next payout</span>
                <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border/70">
                {data.map((income) => (
                    <div
                        key={income.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onView(income)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onView(income);
                            }
                        }}
                        className="group grid cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto] md:px-6 md:py-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-background text-primary shadow-inner shadow-primary/10">
                                <Wallet className="h-5 w-5" aria-hidden />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                    {income.source}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {income.note ?? "No description provided"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-center">
                            <span className="text-base font-semibold text-foreground">
                                {formatCurrency(income.amount)}
                            </span>
                            <span
                                className={`ml-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${recurrenceTone[income.recurrence]}`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {income.recurrence}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-center">
                            <CreditCard className="h-4 w-4 text-primary" aria-hidden />
                            <div className="text-foreground">{income.cadence}</div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-center">
                            <CalendarCheck className="h-4 w-4 text-primary" aria-hidden />
                            <div className="text-foreground">{formatDate(income.paidOn)}</div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-center">
                            <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                            <div className="text-foreground">
                                {income.nextPayout ? formatDate(income.nextPayout) : "—"}
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <IncomeActions
                                onView={() => onView(income)}
                                onEdit={() => onEdit(income)}
                                onDelete={() => onDelete(income)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IncomeTable;
