"use client";

import { CalendarClock, DollarSign, Wallet } from "lucide-react";
import BudgetActions from "./BudgetActions";
import { BudgetRecord, formatCurrency, monthLabels } from "./types";

type Props = {
    data: BudgetRecord[];
    onView: (budget: BudgetRecord) => void;
    onEdit: (budget: BudgetRecord) => void;
    onDelete: (budget: BudgetRecord) => void;
};

export default function BudgetTable({ data, onView, onEdit, onDelete }: Props) {
    if (!data.length) {
        return (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/70 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Wallet className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 text-base font-semibold text-foreground">
                    No budgets to show yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create your first budget to start tracking allocations.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-lg shadow-black/5">
            <div className="hidden bg-muted/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
                <span>Budget</span>
                <span className="text-center">Planned</span>
                <span className="text-center">Spent</span>
                <span className="text-center">Period</span>
                <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border/70">
                {data.map((budget) => (
                    <div
                        key={budget.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onView(budget)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onView(budget);
                            }
                        }}
                        className="group grid cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[1.6fr_1fr_1fr_1fr_auto] md:px-6 md:py-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-background text-primary shadow-inner shadow-primary/10">
                                <DollarSign className="h-5 w-5" aria-hidden />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                    {budget.name}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {budget.category || "General"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-center">
                            <span className="text-base font-semibold text-foreground">
                                {formatCurrency(budget.amount)}
                            </span>
                        </div>

                        <div className="flex flex-col items-start md:items-center">
                            <span className="text-base font-semibold text-foreground">
                                {formatCurrency(budget.spent)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Remaining {formatCurrency(budget.amount - budget.spent)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-center">
                            <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                            <div className="text-foreground">
                                {monthLabels[(budget.month || 1) - 1]} {budget.year}
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <BudgetActions
                                onView={() => onView(budget)}
                                onEdit={() => onEdit(budget)}
                                onDelete={() => onDelete(budget)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
