"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";
import StatCard from "./StatCard";
import SpendingGauge from "./SpendingGauge";
import GoalProgressList from "./GoalProgressList";
import { formatCurrency } from "@/components/shared/income/types";
import { formatDate } from "@/components/shared/goals/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionRecord } from "@/components/shared/transactions/types";
import { GoalRecord } from "@/components/shared/goals/types";
import { IncomeRecord } from "@/components/shared/income/types";

type Summary = {
    incomes: IncomeRecord[];
    transactions: TransactionRecord[];
    goals: GoalRecord[];
};

const defaultSummary: Summary = { incomes: [], transactions: [], goals: [] };

export default function DashboardPageClient() {
    const [summary, setSummary] = useState<Summary>(defaultSummary);
    const [loading, setLoading] = useState(true);
    const [paydayDay, setPaydayDay] = useState(1);
    const [monthlyInflow, setMonthlyInflow] = useState(0);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [incomeRes, txnRes, goalRes] = await Promise.all([
                fetch("/api/incomes", { cache: "no-store" }),
                fetch("/api/transactions", { cache: "no-store" }),
                fetch("/api/goals", { cache: "no-store" }),
            ]);
            const [incomeBody, txnBody, goalBody] = await Promise.all([
                incomeRes.json().catch(() => null),
                txnRes.json().catch(() => null),
                goalRes.json().catch(() => null),
            ]);
            if (!incomeRes.ok) throw new Error(incomeBody?.error ?? "Unable to load incomes.");
            if (!txnRes.ok) throw new Error(txnBody?.error ?? "Unable to load transactions.");
            if (!goalRes.ok) throw new Error(goalBody?.error ?? "Unable to load goals.");

            const incomes = Array.isArray(incomeBody?.data) ? incomeBody.data : [];
            const transactions = Array.isArray(txnBody?.data) ? txnBody.data : [];
            const goals = Array.isArray(goalBody?.data) ? goalBody.data : [];
            setSummary({ incomes, transactions, goals });

            const monthlyIncome = incomes.reduce((sum, inc) => {
                const paid = new Date(inc.paidOn);
                const now = new Date();
                if (paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear()) {
                    return sum + inc.amount;
                }
                return sum;
            }, 0);
            setMonthlyInflow(monthlyIncome || 600000);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Unable to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const now = new Date();
    const { spendThisPeriod, periodDays, elapsedDays } = useMemo(() => {
        const periodStart = new Date(now.getFullYear(), now.getMonth(), paydayDay);
        if (now.getDate() < paydayDay) periodStart.setMonth(periodStart.getMonth() - 1);
        const nextStart = new Date(periodStart);
        nextStart.setMonth(nextStart.getMonth() + 1);

        const spend = summary.transactions
            .filter((txn) => {
                const date = new Date(txn.date);
                return date >= periodStart && date < nextStart;
            })
            .reduce((sum, txn) => sum + txn.amount, 0);

        const daysInPeriod = Math.max(
            Math.round((nextStart.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)),
            1
        );
        const elapsed = Math.min(
            Math.max(Math.round((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)), 1),
            daysInPeriod
        );

        return { spendThisPeriod: spend, periodDays: daysInPeriod, elapsedDays: elapsed };
    }, [now, paydayDay, summary.transactions]);

    const totals = useMemo(() => {
        const totalIncome = summary.incomes.reduce((sum, inc) => sum + inc.amount, 0);
        const totalSpend = summary.transactions.reduce((sum, txn) => sum + txn.amount, 0);
        const completedGoals = summary.goals.filter((g) => g.status === "Completed").length;
        const activeGoals = summary.goals.filter((g) => g.status === "Active").length;
        return { totalIncome, totalSpend, completedGoals, activeGoals };
    }, [summary.goals, summary.incomes, summary.transactions]);

    const burnWarning =
        monthlyInflow > 0 &&
        spendThisPeriod / monthlyInflow >= 0.66 &&
        elapsedDays < periodDays / 2;

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 px-6 py-8 shadow-lg shadow-black/5 md:px-8">
                <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />

                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Sparkles className="h-4 w-4" aria-hidden />
                            Finance cockpit
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
                                Live view of cash, burn, and goals
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                                Track inflows, spending pace, and outcomes. Warnings surface early when burn is too fast relative to your payday cadence.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                Real-time signals
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Goal awareness
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Burn monitoring
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Payday day
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                                <input
                                    type="number"
                                    min={1}
                                    max={28}
                                    value={paydayDay}
                                    onChange={(e) => setPaydayDay(Math.min(28, Math.max(1, Number(e.target.value))))}
                                    className="h-10 w-16 rounded-lg border border-border/60 bg-background px-2 text-sm"
                                />
                                <span className="text-xs text-muted-foreground">
                                    Used to calculate the burn window.
                                </span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Monthly inflow (RWF)
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    step="50000"
                                    value={monthlyInflow}
                                    onChange={(e) => setMonthlyInflow(Number(e.target.value))}
                                    className="h-10 w-32 rounded-lg border border-border/60 bg-background px-2 text-sm"
                                />
                                <span className="text-xs text-muted-foreground">
                                    Autofilled from incomes; adjust if needed.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total income"
                    value={formatCurrency(totals.totalIncome)}
                    hint="All time inflows recorded"
                    icon={<Coins className="h-5 w-5" aria-hidden />}
                    loading={loading}
                />
                <StatCard
                    title="Total spend"
                    value={formatCurrency(totals.totalSpend)}
                    hint="All time transactions"
                    icon={<AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />}
                    loading={loading}
                />
                <StatCard
                    title="Goals completed"
                    value={`${totals.completedGoals} / ${summary.goals.length || 0}`}
                    hint={`${totals.activeGoals} active, ${totals.completedGoals} completed`}
                    icon={<CalendarClock className="h-5 w-5" aria-hidden />}
                    loading={loading}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <SpendingGauge
                    inflow={monthlyInflow}
                    spend={spendThisPeriod}
                    daysElapsed={elapsedDays}
                    daysInPeriod={periodDays}
                    loading={loading}
                />
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Goal tracker
                            </p>
                            <h3 className="text-base font-semibold text-foreground">Progress and targets</h3>
                        </div>
                        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="mt-4">
                        <GoalProgressList goals={summary.goals} loading={loading} />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-5 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            Alerts
                        </p>
                        <h3 className="text-base font-semibold text-foreground">
                            Automatic warnings based on burn
                        </h3>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    {loading ? (
                        <>
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </>
                    ) : (
                        <>
                            {burnWarning ? (
                                <div className="flex items-start gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-700">
                                    <AlertTriangle className="h-5 w-5 mt-0.5" aria-hidden />
                                    <div>
                                        <p className="text-sm font-semibold">
                                            High burn detected before mid-period
                                        </p>
                                        <p className="text-xs">
                                            You have spent {formatCurrency(spendThisPeriod)} of {formatCurrency(monthlyInflow)} by day {elapsedDays} of {periodDays}.
                                            Consider slowing spend until payday.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-700">
                                    <Sparkles className="h-5 w-5 mt-0.5" aria-hidden />
                                    <div>
                                        <p className="text-sm font-semibold">Burn rate healthy</p>
                                        <p className="text-xs">
                                            Spend pace is on track for the current pay period.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {summary.goals.some((g) => g.status === "Completed") ? (
                                <div className="flex items-start gap-3 rounded-xl border border-primary/50 bg-primary/10 px-4 py-3 text-primary">
                                    <CalendarClock className="h-5 w-5 mt-0.5" aria-hidden />
                                    <div>
                                        <p className="text-sm font-semibold">Goals achieved</p>
                                        <p className="text-xs">
                                            {summary.goals
                                                .filter((g) => g.status === "Completed")
                                                .map((g) => g.name)
                                                .join(", ") || "Completed goals"}{" "}
                                            reached. Target dates:{" "}
                                            {summary.goals
                                                .filter((g) => g.status === "Completed" && g.targetDate)
                                                .map((g) => formatDate(g.targetDate!))
                                                .join(", ") || "not provided"}.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 rounded-xl border border-foreground/20 bg-foreground/5 px-4 py-3 text-foreground">
                                    <Flag className="h-5 w-5 mt-0.5" aria-hidden />
                                    <div>
                                        <p className="text-sm font-semibold">No completed goals yet</p>
                                        <p className="text-xs">
                                            Stay the course and update statuses as you hit milestones.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
