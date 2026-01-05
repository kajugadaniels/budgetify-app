"use client";

import React, { useMemo } from "react";
import { CalendarDays, Sparkles, Wallet2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import IncomeForm from "./IncomeForm";
import {
    IncomeFormValues,
    IncomeRecord,
    defaultIncomeFormValues,
    formatCurrency,
    formatDate,
} from "./types";

type IncomeFormSheetProps = {
    open: boolean;
    mode: "create" | "edit";
    income: IncomeRecord | null;
    onClose: () => void;
    onSubmit: (values: IncomeFormValues) => void;
};

const IncomeFormSheet = ({ open, mode, income, onClose, onSubmit }: IncomeFormSheetProps) => {
    const initialValues = useMemo<IncomeFormValues>(() => {
        if (!income) return defaultIncomeFormValues();

        const nextPayoutDate = income.nextPayout ? new Date(income.nextPayout) : null;
        const normalizedDate =
            nextPayoutDate && !Number.isNaN(nextPayoutDate.getTime())
                ? nextPayoutDate.toISOString().slice(0, 10)
                : "";

        const paidOnDate = income.paidOn ? new Date(income.paidOn) : null;
        const normalizedPaidOn =
            paidOnDate && !Number.isNaN(paidOnDate.getTime())
                ? paidOnDate.toISOString().slice(0, 10)
                : "";

        return {
            source: income.source,
            category: income.category,
            recurrence: income.recurrence,
            cadence: income.cadence,
            paidOn: normalizedPaidOn,
            nextPayout: normalizedDate,
            amount: income.amount,
            note: income.note ?? "",
            account: income.account ?? "",
        };
    }, [income]);

    if (!open) return null;

    const isCreate = mode === "create";

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="flex h-full w-full max-w-xl flex-col border-l border-border/60 bg-card/95 px-6 py-6 shadow-2xl shadow-black/25 transition-transform duration-200 ease-out"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                            {isCreate ? "Add income" : "Edit income"}
                        </p>
                        <h3 className="text-2xl font-semibold text-foreground">
                            {isCreate ? "Open a new stream" : income?.source ?? "Update income"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Capture every inflow with clarity. One form powers create and edit.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </Button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-primary">
                            Committed
                            <Wallet2 className="h-4 w-4" aria-hidden />
                        </div>
                        <p className="mt-2 text-xl font-semibold text-foreground">
                            {formatCurrency(initialValues.amount || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Per payout</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Next payout
                            <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                            {initialValues.recurrence === "Recurring"
                                ? formatDate(initialValues.nextPayout)
                                : "Not scheduled"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {initialValues.recurrence === "Recurring"
                                ? "Stay ahead of cash timing"
                                : "One-time receipt, no future payout"}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/10 via-card to-background px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Recurrence
                            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                            {initialValues.recurrence}
                        </p>
                        <p className="text-xs text-muted-foreground">Cadence you can rely on</p>
                    </div>
                </div>

                <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-inner shadow-black/5">
                    <IncomeForm
                        mode={mode}
                        initialValues={initialValues}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
};

export default IncomeFormSheet;
