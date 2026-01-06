"use client";

import { CalendarClock, Flag, Target } from "lucide-react";
import GoalActions from "./GoalActions";
import { GoalRecord, formatCurrency, formatDate } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

type GoalTableProps = {
    data: GoalRecord[];
    loading?: boolean;
    onView: (goal: GoalRecord) => void;
    onEdit: (goal: GoalRecord) => void;
    onDelete: (goal: GoalRecord) => void;
};

const statusTone: Record<GoalRecord["status"], string> = {
    Planning: "bg-foreground/5 text-foreground",
    Active: "bg-primary/10 text-primary",
    Completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    Paused: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const skeletonRows = Array.from({ length: 4 }).map((_, index) => (
    <div
        key={index}
        className="grid gap-3 px-4 py-4 md:grid-cols-[1.6fr_1fr_1fr_1fr_auto] md:px-6 md:py-5"
    >
        <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
        <div className="flex items-center gap-2 md:justify-center">
            <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-2 md:justify-center">
            <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center gap-2 md:justify-center">
            <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
    </div>
));

const GoalTable = ({ data, loading = false, onView, onEdit, onDelete }: GoalTableProps) => {
    if (loading) {
        return (
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-lg shadow-black/5">
                <div className="hidden bg-muted/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
                    <span>Goal</span>
                    <span className="text-center">Amount</span>
                    <span className="text-center">Status</span>
                    <span className="text-center">Target date</span>
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
                    <Target className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 text-base font-semibold text-foreground">
                    No goals added yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add your first goal to start tracking progress.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-lg shadow-black/5">
            <div className="hidden bg-muted/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
                <span>Goal</span>
                <span className="text-center">Amount</span>
                <span className="text-center">Status</span>
                <span className="text-center">Target date</span>
                <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border/70">
                {data.map((goal) => (
                    <div
                        key={goal.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onView(goal)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onView(goal);
                            }
                        }}
                        className="group grid cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[1.6fr_1fr_1fr_1fr_auto] md:px-6 md:py-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-background text-primary shadow-inner shadow-primary/10">
                                <Flag className="h-5 w-5" aria-hidden />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                    {goal.name}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {goal.note ?? "No description provided"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-start md:justify-center">
                            <span className="text-base font-semibold text-foreground">
                                {formatCurrency(goal.amount)}
                            </span>
                        </div>

                        <div className="flex items-center justify-start md:justify-center">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusTone[goal.status]}`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {goal.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-center">
                            <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                            <div className="text-foreground">{formatDate(goal.targetDate)}</div>
                        </div>

                        <div className="flex items-center justify-end">
                            <GoalActions
                                onView={() => onView(goal)}
                                onEdit={() => onEdit(goal)}
                                onDelete={() => onDelete(goal)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoalTable;
