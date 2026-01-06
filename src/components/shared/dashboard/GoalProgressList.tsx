"use client";

import { CheckCircle2, Loader2, PauseCircle, Target } from "lucide-react";
import { GoalRecord, formatCurrency, formatDate } from "@/components/shared/goals/types";
import { Skeleton } from "@/components/ui/skeleton";

type GoalProgressListProps = {
    goals: GoalRecord[];
    loading?: boolean;
};

const statusIcon: Record<GoalRecord["status"], React.ReactNode> = {
    Planning: <Target className="h-4 w-4 text-primary" aria-hidden />,
    Active: <Loader2 className="h-4 w-4 text-primary animate-spin-slow" aria-hidden />,
    Completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />,
    Paused: <PauseCircle className="h-4 w-4 text-amber-500" aria-hidden />,
};

const GoalProgressList = ({ goals, loading = false }: GoalProgressListProps) => {
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-4 w-40 rounded" />
                            <Skeleton className="h-3 w-32 rounded" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (!goals.length) {
        return (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/80 p-4 text-sm text-muted-foreground">
                No goals yet. Create one to start tracking progress.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {goals.map((goal) => (
                <div
                    key={goal.id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {statusIcon[goal.status]}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{goal.name}</p>
                        <p className="text-xs text-muted-foreground">
                            Target {formatCurrency(goal.amount)} · {goal.status} ·{" "}
                            {goal.targetDate ? formatDate(goal.targetDate) : "No target date"}
                        </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                        {goal.status}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default GoalProgressList;
