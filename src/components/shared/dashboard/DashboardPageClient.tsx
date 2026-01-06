"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CalendarClock,
    CreditCard,
    Coins,
    Flag,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import StatCard from "./StatCard";
import SpendingGauge from "./SpendingGauge";
import GoalProgressList from "./GoalProgressList";
import MonthlyFlowChart from "./MonthlyFlowChart";
import CategoryBreakdownPie from "./CategoryBreakdownPie";
import DashboardFilters, { monthLabels } from "./DashboardFilters";
import CumulativeNetChart from "./CumulativeNetChart";
import PaymentMethodBar from "./PaymentMethodBar";
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
const msInDay = 1000 * 60 * 60 * 24;

export default function DashboardPageClient() {
    const now = new Date();
    const [summary, setSummary] = useState<Summary>(defaultSummary);
    const [loading, setLoading] = useState(true);
    const [paydayDay, setPaydayDay] = useState(1);
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [inflowOverride, setInflowOverride] = useState<number | null>(null);

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

    useEffect(() => {
        // Revert to auto-calculated inflow when the time frame changes.
        setInflowOverride(null);
    }, [month, year]);

    const monthStart = useMemo(() => new Date(year, month - 1, 1), [month, year]);
    const monthEnd = useMemo(() => new Date(year, month, 1), [month, year]);
    const daysInSelectedMonth = useMemo(
        () => new Date(year, month, 0).getDate(),
        [month, year]
    );

    const filteredIncomes = useMemo(
        () =>
            summary.incomes.filter((inc) => {
                const paid = new Date(inc.paidOn);
                return paid >= monthStart && paid < monthEnd;
            }),
        [monthEnd, monthStart, summary.incomes]
    );

    const filteredTransactions = useMemo(
        () =>
            summary.transactions.filter((txn) => {
                const date = new Date(txn.date);
                return date >= monthStart && date < monthEnd;
            }),
        [monthEnd, monthStart, summary.transactions]
    );

    const monthlyIncome = useMemo(
        () => filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0),
        [filteredIncomes]
    );
    const monthlySpend = useMemo(
        () => filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0),
        [filteredTransactions]
    );
    const monthlyNet = monthlyIncome - monthlySpend;

    const periodStart = useMemo(() => {
        const start = new Date(year, month - 1, paydayDay);
        if (month === now.getMonth() + 1 && year === now.getFullYear() && now.getDate() < paydayDay) {
            start.setMonth(start.getMonth() - 1);
        }
        return start;
    }, [month, now, paydayDay, year]);

    const periodEnd = useMemo(() => {
        const end = new Date(periodStart);
        end.setMonth(end.getMonth() + 1);
        return end;
    }, [periodStart]);

    const periodTransactions = useMemo(
        () =>
            summary.transactions.filter((txn) => {
                const date = new Date(txn.date);
                return date >= periodStart && date < periodEnd;
            }),
        [periodEnd, periodStart, summary.transactions]
    );

    const periodIncome = useMemo(
        () =>
            summary.incomes
                .filter((inc) => {
                    const paid = new Date(inc.paidOn);
                    return paid >= periodStart && paid < periodEnd;
                })
                .reduce((sum, inc) => sum + inc.amount, 0),
        [periodEnd, periodStart, summary.incomes]
    );

    const defaultInflow = monthlyIncome || periodIncome || 600000;
    const inflowForPeriod = inflowOverride ?? defaultInflow;
    const spendThisPeriod = useMemo(
        () => periodTransactions.reduce((sum, txn) => sum + txn.amount, 0),
        [periodTransactions]
    );

    const periodDays = useMemo(
        () => Math.max(Math.round((periodEnd.getTime() - periodStart.getTime()) / msInDay), 1),
        [periodEnd, periodStart]
    );
    const isCurrentPeriod = now >= periodStart && now < periodEnd;
    const elapsedDays = isCurrentPeriod
        ? Math.min(Math.max(Math.floor((now.getTime() - periodStart.getTime()) / msInDay) + 1, 1), periodDays)
        : periodDays;

    const burnWarning =
        inflowForPeriod > 0 && spendThisPeriod / inflowForPeriod >= 0.66 && elapsedDays < periodDays / 2;

    const flowData = useMemo(() => {
        const incomeByDay = new Map<number, number>();
        filteredIncomes.forEach((inc) => {
            const day = new Date(inc.paidOn).getDate();
            incomeByDay.set(day, (incomeByDay.get(day) ?? 0) + inc.amount);
        });

        const spendByDay = new Map<number, number>();
        filteredTransactions.forEach((txn) => {
            const day = new Date(txn.date).getDate();
            spendByDay.set(day, (spendByDay.get(day) ?? 0) + txn.amount);
        });

        return Array.from({ length: daysInSelectedMonth }, (_, index) => {
            const day = index + 1;
            return {
                day,
                income: incomeByDay.get(day) ?? 0,
                spend: spendByDay.get(day) ?? 0,
            };
        });
    }, [daysInSelectedMonth, filteredIncomes, filteredTransactions]);

    const netFlowData = useMemo(() => {
        let runningNet = 0;
        return flowData.map((item) => {
            runningNet += item.income - item.spend;
            return { day: item.day, net: runningNet };
        });
    }, [flowData]);

    const categoryData = useMemo(() => {
        const categoryTotals = new Map<string, number>();
        filteredTransactions.forEach((txn) => {
            categoryTotals.set(txn.category, (categoryTotals.get(txn.category) ?? 0) + txn.amount);
        });
        return Array.from(categoryTotals.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    const methodData = useMemo(() => {
        const totals = new Map<string, number>();
        filteredTransactions.forEach((txn) => {
            totals.set(txn.method, (totals.get(txn.method) ?? 0) + txn.amount);
        });
        return ["Card", "Cash", "Transfer", "Mobile"]
            .map((method) => ({ name: method, value: totals.get(method) ?? 0 }))
            .filter((item) => item.value > 0);
    }, [filteredTransactions]);

    const goalStats = useMemo(() => {
        const completedGoals = summary.goals.filter((g) => g.status === "Completed").length;
        const activeGoals = summary.goals.filter((g) => g.status === "Active").length;
        return { completedGoals, activeGoals };
    }, [summary.goals]);

    const selectedMonthLabel = monthLabels[month - 1];

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
                                Track monthly inflows, spending pace, and outcomes. Warnings surface early when burn is too fast relative to your payday cadence.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                Monthly filters
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
                                    onChange={(e) =>
                                        setPaydayDay(Math.min(28, Math.max(1, Number(e.target.value))))}
                                    className="h-10 w-16 rounded-lg border border-border/60 bg-background px-2 text-sm"
                                />
                                <span className="text-xs text-muted-foreground">
                                    Used to calculate the burn window.
                                </span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Expected inflow (RWF)
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    step="50000"
                                    value={inflowOverride ?? defaultInflow}
                                    onChange={(e) => setInflowOverride(Number(e.target.value))}
                                    className="h-10 w-32 rounded-lg border border-border/60 bg-background px-2 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setInflowOverride(null)}
                                    className="text-xs font-semibold text-primary hover:underline"
                                >
                                    Reset to auto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative mt-6">
                    <DashboardFilters
                        month={month}
                        year={year}
                        onMonthChange={setMonth}
                        onYearChange={setYear}
                    />
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Income this month"
                    value={formatCurrency(monthlyIncome)}
                    hint={`${selectedMonthLabel} ${year}`}
                    icon={<Coins className="h-5 w-5" aria-hidden />}
                    loading={loading}
                />
                <StatCard
                    title="Spend this month"
                    value={formatCurrency(monthlySpend)}
                    hint={`${filteredTransactions.length} transactions`}
                    icon={<AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />}
                    loading={loading}
                />
                <StatCard
                    title="Net position"
                    value={formatCurrency(monthlyNet)}
                    hint={`${goalStats.activeGoals} active goals • ${goalStats.completedGoals} completed`}
                    icon={<CalendarClock className="h-5 w-5" aria-hidden />}
                    loading={loading}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <SpendingGauge
                    inflow={inflowForPeriod}
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

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Cash flow
                            </p>
                            <h3 className="text-base font-semibold text-foreground">
                                Daily inflow vs spend — {selectedMonthLabel} {year}
                            </h3>
                        </div>
                        <LineChartIcon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="mt-3">
                        <MonthlyFlowChart data={flowData} loading={loading} />
                    </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Category impact
                            </p>
                            <h3 className="text-base font-semibold text-foreground">
                                Where money went — {selectedMonthLabel}
                            </h3>
                        </div>
                        <PieChartIcon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="mt-3">
                        <CategoryBreakdownPie data={categoryData} loading={loading} />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Net glidepath
                            </p>
                            <h3 className="text-base font-semibold text-foreground">
                                Cumulative net change — {selectedMonthLabel} {year}
                            </h3>
                        </div>
                        <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="mt-3">
                        <CumulativeNetChart data={netFlowData} loading={loading} />
                    </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Payment methods
                            </p>
                            <h3 className="text-base font-semibold text-foreground">
                                Mix by amount — {selectedMonthLabel}
                            </h3>
                        </div>
                        <CreditCard className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="mt-3">
                        <PaymentMethodBar data={methodData} loading={loading} />
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
                                    <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden />
                                    <div>
                                        <p className="text-sm font-semibold">High burn detected</p>
                                        <p className="text-xs">
                                            You have spent {formatCurrency(spendThisPeriod)} of{" "}
                                            {formatCurrency(inflowForPeriod)} by day {elapsedDays} of {periodDays}.
                                            Consider slowing spend until payday.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-700">
                                    <Sparkles className="mt-0.5 h-5 w-5" aria-hidden />
                                    <div>
                                        <p className="text-sm font-semibold">Burn rate healthy</p>
                                        <p className="text-xs">
                                            Spend pace is on track for this pay period.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {summary.goals.some((g) => g.status === "Completed") ? (
                                <div className="flex items-start gap-3 rounded-xl border border-primary/50 bg-primary/10 px-4 py-3 text-primary">
                                    <CalendarClock className="mt-0.5 h-5 w-5" aria-hidden />
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
                                    <Flag className="mt-0.5 h-5 w-5" aria-hidden />
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
