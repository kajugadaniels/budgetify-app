"use client";

import { CalendarClock, Flag, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalRecord, formatCurrency, formatDate } from "./types";

type GoalDetailsSheetProps = {
    goal: GoalRecord | null;
    onClose: () => void;
    loading?: boolean;
};

const metadata: { label: string; key: keyof GoalRecord; icon?: React.ElementType }[] = [
    { label: "Name", key: "name", icon: Wallet },
    { label: "Amount", key: "amount" },
    { label: "Status", key: "status", icon: Flag },
    { label: "Target date", key: "targetDate", icon: CalendarClock },
    { label: "Notes", key: "note" },
];

const GoalDetailsSheet = ({ goal, onClose, loading = false }: GoalDetailsSheetProps) => {
    if (!goal && !loading) return null;

    if (loading) {
        return (
            <div
                className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="h-full w-full max-w-md border-l border-border/60 bg-card/95 px-6 py-6 shadow-2xl shadow-black/25 transition-transform duration-200 ease-out"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24 rounded" />
                            <Skeleton className="h-6 w-48 rounded" />
                            <Skeleton className="h-4 w-60 rounded" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="mt-6 rounded-2xl border border-border/60 bg-background/80 px-5 py-4 space-y-2">
                        <Skeleton className="h-3 w-28 rounded" />
                        <Skeleton className="h-8 w-32 rounded" />
                        <Skeleton className="h-3 w-24 rounded" />
                    </div>
                    <div className="mt-6 space-y-3">
                        {[...Array(5)].map((_, index) => (
                            <div
                                key={index}
                                className="flex items-start justify-between gap-4 rounded-xl border border-border/60 px-4 py-3"
                            >
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-3 w-20 rounded" />
                                </div>
                                <Skeleton className="h-4 w-28 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="h-full w-full max-w-md border-l border-border/60 bg-card/95 px-6 py-6 shadow-2xl shadow-black/25 transition-transform duration-200 ease-out"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                            Goal details
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold text-foreground">
                            {goal?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {goal?.note ?? "No description provided."}
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

                <div className="mt-6 rounded-2xl border border-border/60 bg-background/80 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Target amount
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                        {formatCurrency(goal?.amount ?? 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">{goal?.status ?? "Planning"}</p>
                </div>

                <dl className="mt-6 space-y-3">
                    {metadata.map((item) => {
                        const value = goal?.[item.key];
                        if (value === undefined || value === null || value === "") return null;

                        const Icon = item.icon;
                        const displayValue =
                            item.key === "amount"
                                ? formatCurrency(Number(value))
                                : item.key === "targetDate"
                                    ? formatDate(String(value))
                                    : String(value);

                        return (
                            <div
                                key={item.key}
                                className="flex items-start justify-between gap-4 rounded-xl border border-border/60 px-4 py-3"
                            >
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
                                    <span className="text-xs uppercase tracking-[0.22em]">
                                        {item.label}
                                    </span>
                                </div>
                                <p className="max-w-[60%] text-sm font-medium text-foreground text-right">
                                    {displayValue}
                                </p>
                            </div>
                        );
                    })}
                </dl>
            </div>
        </div>
    );
};

export default GoalDetailsSheet;
