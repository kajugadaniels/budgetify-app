"use client";

import { useEffect, useState } from "react";

export type IncomeFilters = {
    search?: string;
    month?: number;
    year?: number;
};

type Props = {
    open: boolean;
    onClose: () => void;
    initialFilters: IncomeFilters;
    onApply: (filters: IncomeFilters) => void;
    onReset: () => void;
};

export default function IncomeFilterSheet({
    open,
    onClose,
    initialFilters,
    onApply,
    onReset,
}: Props) {
    const [search, setSearch] = useState(initialFilters.search ?? "");
    const [month, setMonth] = useState<number | undefined>(initialFilters.month);
    const [year, setYear] = useState<number | undefined>(initialFilters.year);

    useEffect(() => {
        setSearch(initialFilters.search ?? "");
        setMonth(initialFilters.month);
        setYear(initialFilters.year);
    }, [initialFilters]);

    const handleApply = () => {
        onApply({
            search: search.trim() || undefined,
            month,
            year,
        });
    };

    const handleReset = () => {
        setSearch("");
        setMonth(undefined);
        setYear(undefined);
        onReset();
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black/30"
                    onClick={onClose}
                    aria-hidden
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-full max-w-md transform border-r border-border/60 bg-card/95 shadow-xl backdrop-blur transition-transform duration-300 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
                aria-hidden={!open}
            >
                <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Filters</p>
                        <p className="text-xs text-muted-foreground">
                            Narrow your income view.
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
                <div className="space-y-4 px-6 py-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Search
                        </label>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search note…"
                            className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Month
                            </label>
                            <select
                                value={month ?? ""}
                                onChange={(e) =>
                                    setMonth(
                                        e.target.value
                                            ? Number.parseInt(e.target.value, 10)
                                            : undefined
                                    )
                                }
                                className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            >
                                <option value="">Any</option>
                                {Array.from({ length: 12 }).map((_, idx) => (
                                    <option key={idx + 1} value={idx + 1}>
                                        {idx + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Year
                            </label>
                            <input
                                type="number"
                                value={year ?? ""}
                                onChange={(e) =>
                                    setYear(
                                        e.target.value
                                            ? Number.parseInt(e.target.value, 10)
                                            : undefined
                                    )
                                }
                                placeholder="Any"
                                className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border/60 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        Reset
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 rounded-lg px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
