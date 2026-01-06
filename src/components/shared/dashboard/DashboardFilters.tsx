"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DashboardFiltersProps = {
    month: number;
    year: number;
    onMonthChange: (value: number) => void;
    onYearChange: (value: number) => void;
};

const monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const yearOptions = (() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1];
})();

const DashboardFilters = ({ month, year, onMonthChange, onYearChange }: DashboardFiltersProps) => {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Timeframe
            </div>
            <Select value={String(month)} onValueChange={(value) => onMonthChange(Number(value))}>
                <SelectTrigger className="h-10 w-40 rounded-xl border-border/60 bg-background/80">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent align="start">
                    {monthLabels.map((label, index) => (
                        <SelectItem key={label} value={String(index + 1)}>
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(value) => onYearChange(Number(value))}>
                <SelectTrigger className="h-10 w-28 rounded-xl border-border/60 bg-background/80">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent align="start">
                    {yearOptions.map((yr) => (
                        <SelectItem key={yr} value={String(yr)}>
                            {yr}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export { monthLabels };
export default DashboardFilters;
