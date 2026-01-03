"use client";

import { Button } from "@/components/ui/button";
import { IncomeRecord } from "./IncomePageClient";

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
                    <Button variant="outline" size="sm" onClick={onOpenFilters}>
                        Filters
                    </Button>
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                        Refresh
                    </Button>
                </div>
                <Button size="sm" onClick={onAdd}>
                    Add income
                </Button>
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
                                className="transition-colors hover:bg-muted/30"
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onView(income)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(income)}
                                        >
                                            Edit
                                        </Button>
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
