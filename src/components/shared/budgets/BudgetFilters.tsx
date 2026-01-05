"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BudgetFilters } from "./types";

type Props = {
    initial: BudgetFilters;
    onApply: (filters: BudgetFilters) => void;
    onReset: () => void;
};

export default function BudgetFilters({ initial, onApply, onReset }: Props) {
    const [search, setSearch] = useState(initial.search ?? "");
    const [category, setCategory] = useState(initial.category ?? "");
    const [month, setMonth] = useState<number | undefined>(initial.month);
    const [year, setYear] = useState<number | undefined>(initial.year);

    useEffect(() => {
        setSearch(initial.search ?? "");
        setCategory(initial.category ?? "");
        setMonth(initial.month);
        setYear(initial.year);
    }, [initial]);

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search budget…"
                className="h-11 min-w-[220px] flex-1 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="h-11 min-w-[160px] rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <select
                value={month ?? ""}
                onChange={(e) =>
                    setMonth(
                        e.target.value ? Number.parseInt(e.target.value, 10) : undefined
                    )
                }
                className="h-11 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
                <option value="">Any month</option>
                {Array.from({ length: 12 }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                        {idx + 1}
                    </option>
                ))}
            </select>
            <input
                type="number"
                value={year ?? ""}
                onChange={(e) =>
                    setYear(
                        e.target.value ? Number.parseInt(e.target.value, 10) : undefined
                    )
                }
                placeholder="Year"
                className="h-11 w-28 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <div className="ml-auto flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSearch("");
                        setCategory("");
                        setMonth(undefined);
                        setYear(undefined);
                        onReset();
                    }}
                >
                    Reset
                </Button>
                <Button
                    size="sm"
                    onClick={() =>
                        onApply({
                            search: search.trim() || undefined,
                            category: category.trim() || undefined,
                            month,
                            year,
                        })
                    }
                >
                    Apply
                </Button>
            </div>
        </div>
    );
}
