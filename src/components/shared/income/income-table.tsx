"use client";

import { IncomeRecord } from "./income-page-client";

type Props = {
    incomes: IncomeRecord[];
    months: string[];
    isLoading: boolean;
    onOpenFilters: () => void;
    onAdd: () => void;
    onEdit: (income: IncomeRecord) => void;
    onView: (income: IncomeRecord) => void;
    onRefresh: () => void;
};

export default function IncomeTable({
    incomes,
    months,
    isLoading,
    onOpenFilters,
    onAdd,
    onEdit,
    onView,
    onRefresh,
}: Props) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenFilters}
                        className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-primary"
                    >
                        Filters
                    </button>
                    <button
                        type="button"
                        onClick={onRefresh}
                        className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        Refresh
                    </button>
                </div>
                <button
                    type="button"
                    onClick={onAdd}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                    Add income
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/60 text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Period</th>
                            <th className="px-4 py-3 text-left font-medium">Amount</th>
                            <th className="px-4 py-3 text-left font-medium">Note</th>
                            <th className="px-4 py-3 text-left font-medium">Updated</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {incomes.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-6 text-center text-muted-foreground"
                                >
                                    {isLoading ? "Loading…" : "No incomes found."}
                                </td>
                            </tr>
                        )}
                        {incomes.map((income) => (
                            <tr
                                key={income.id}
                                className="hover:bg-muted/30 transition-colors"
                            >
                                <td className="px-4 py-3 font-medium text-foreground">
                                    {months[(income.month || 1) - 1]} {income.year}
                                </td>
                                <td className="px-4 py-3 text-foreground">
                                    ${income.amount.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {income.note?.trim() || "—"}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {new Date(income.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <div className="inline-flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onView(income)}
                                            className="rounded-lg border border-border/60 px-3 py-1 text-muted-foreground hover:text-foreground"
                                        >
                                            View
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onEdit(income)}
                                            className="rounded-lg border border-border/60 px-3 py-1 text-muted-foreground hover:text-foreground"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
