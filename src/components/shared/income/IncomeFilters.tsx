"use client";

import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecurrenceFilter, TimeframeFilter } from "./types";

type IncomeFiltersProps = {
    timeframe: TimeframeFilter;
    recurrence: RecurrenceFilter;
    onTimeframeChange: (value: TimeframeFilter) => void;
    onRecurrenceChange: (value: RecurrenceFilter) => void;
    onReset?: () => void;
};

const timeframeOptions: { label: string; value: TimeframeFilter }[] = [
    { label: "This month", value: "this-month" },
    { label: "Last month", value: "last-month" },
    { label: "Quarter to date", value: "quarter" },
    { label: "Year to date", value: "year" },
    { label: "All time", value: "all" },
];

const recurrenceOptions: { label: string; value: RecurrenceFilter }[] = [
    { label: "All incomes", value: "all" },
    { label: "Recurring", value: "recurring" },
    { label: "One-time", value: "one-time" },
];

const IncomeFilters = ({
    timeframe,
    recurrence,
    onTimeframeChange,
    onRecurrenceChange,
    onReset,
}: IncomeFiltersProps) => {
    return (
        <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm md:px-5 md:py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Filter className="h-4 w-4" aria-hidden />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Filters</p>
                        <p className="text-xs text-muted-foreground">
                            Narrow by period and cadence for focused review.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                            onTimeframeChange("this-month");
                            onRecurrenceChange("all");
                            onReset?.();
                        }}
                    >
                        <RotateCcw className="h-4 w-4" aria-hidden />
                        Reset
                    </Button>
                </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1.8fr_1fr] md:items-center">
                <div className="flex flex-wrap gap-2">
                    {timeframeOptions.map((option) => (
                        <Button
                            key={option.value}
                            type="button"
                            size="sm"
                            variant={timeframe === option.value ? "default" : "outline"}
                            className="rounded-full px-4"
                            onClick={() => onTimeframeChange(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                    {recurrenceOptions.map((option) => (
                        <Button
                            key={option.value}
                            type="button"
                            size="sm"
                            variant={recurrence === option.value ? "default" : "outline"}
                            className="rounded-full px-4"
                            onClick={() => onRecurrenceChange(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IncomeFilters;
