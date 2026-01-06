"use client";

import { AlertTriangle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/components/shared/income/types";

type SpendingGaugeProps = {
    inflow: number;
    spend: number;
    daysElapsed: number;
    daysInPeriod: number;
    loading?: boolean;
};

const SpendingGauge = ({ inflow, spend, daysElapsed, daysInPeriod, loading = false }: SpendingGaugeProps) => {
    const safeDaily = inflow > 0 && daysInPeriod > 0 ? inflow / daysInPeriod : 0;
    const actualDaily = daysElapsed > 0 ? spend / daysElapsed : 0;
    const burnRate = safeDaily ? actualDaily / safeDaily : 0;
    const barFill = Math.min(1, spend / Math.max(inflow, 1));
    const overSpend = burnRate >= 1.05;

    return (
        <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Wallet className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Spending pace</p>
                        {loading ? (
                            <Skeleton className="mt-1 h-6 w-32 rounded" />
                        ) : (
                            <p className="text-base font-semibold text-foreground">
                                {formatCurrency(spend)} used / {formatCurrency(inflow)} planned
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Period: day {daysElapsed} of {daysInPeriod}
                        </p>
                    </div>
                </div>
                {!loading && overSpend ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
                        <AlertTriangle className="h-4 w-4" aria-hidden />
                        High burn rate
                    </span>
                ) : null}
            </div>

            <div className="mt-4 space-y-2">
                {loading ? (
                    <Skeleton className="h-4 w-full rounded-full" />
                ) : (
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                overSpend ? "bg-amber-500" : "bg-primary"
                            )}
                            style={{ width: `${barFill * 100}%` }}
                        />
                    </div>
                )}
                {!loading ? (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Safe pace {formatCurrency(safeDaily)}/day</span>
                        <span className={cn(overSpend ? "text-amber-600 font-semibold" : "")}>
                            Actual {formatCurrency(actualDaily)}/day
                        </span>
                    </div>
                ) : (
                    <Skeleton className="h-3 w-48 rounded" />
                )}
            </div>
        </div>
    );
};

export default SpendingGauge;
