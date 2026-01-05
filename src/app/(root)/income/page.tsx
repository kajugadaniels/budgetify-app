"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, LightbulbIcon, Loader2, PiggyBank, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import IncomeFilters from "@/components/shared/income/IncomeFilters";
import IncomeTable from "@/components/shared/income/IncomeTable";
import IncomeDetailsSheet from "@/components/shared/income/IncomeDetailsSheet";
import IncomeFormSheet from "@/components/shared/income/IncomeFormSheet";
import {
    IncomeRecord,
    IncomeFormValues,
    RecurrenceFilter,
    TimeframeFilter,
    formatCurrency,
    formatDate,
} from "@/components/shared/income/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const incomeSeed: IncomeRecord[] = [
    {
        id: "inc-001",
        source: "Atlas Corp — Base Salary",
        category: "Salary",
        recurrence: "Recurring",
        cadence: "Monthly · 28th",
        paidOn: "2025-01-01",
        nextPayout: "2025-01-28",
        amount: 8200,
        note: "Base compensation with wellness stipend.",
        account: "Checking • 2841",
    },
    {
        id: "inc-002",
        source: "Northwind Consulting",
        category: "Consulting",
        recurrence: "Recurring",
        cadence: "Bi-weekly · Fridays",
        paidOn: "2025-01-03",
        nextPayout: "2025-01-17",
        amount: 2400,
        note: "Retainer for GTM advisory.",
        account: "Business • 7710",
    },
    {
        id: "inc-003",
        source: "Dividend portfolio",
        category: "Investments",
        recurrence: "Recurring",
        cadence: "Monthly · 15th",
        paidOn: "2025-01-15",
        nextPayout: "2025-02-15",
        amount: 650,
        note: "High-dividend ETFs allocation.",
        account: "Brokerage • 0199",
    },
    {
        id: "inc-004",
        source: "Product launch bonus",
        category: "Bonus",
        recurrence: "One-time",
        cadence: "Single disbursement",
        paidOn: "2025-02-10",
        nextPayout: null,
        amount: 3200,
        note: "Q1 launch performance bonus.",
        account: "Checking • 2841",
    },
    {
        id: "inc-005",
        source: "Studio rental",
        category: "Other",
        recurrence: "Recurring",
        cadence: "Monthly · 1st",
        paidOn: "2025-02-01",
        nextPayout: "2025-03-01",
        amount: 1150,
        note: "Long-term rental agreement.",
        account: "Savings • 9934",
    },
];

const IncomePage = () => {
    const [timeframe, setTimeframe] = useState<TimeframeFilter>("this-month");
    const [recurrence, setRecurrence] = useState<RecurrenceFilter>("all");
    const [entries, setEntries] = useState<IncomeRecord[]>([]);
    const [selectedIncome, setSelectedIncome] = useState<IncomeRecord | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editableIncome, setEditableIncome] = useState<IncomeRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<IncomeRecord | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const filteredEntries = useMemo(
        () =>
            entries.filter((income) => {
                const matchesTimeframe = isWithinTimeframe(income.paidOn, timeframe);
                const matchesRecurrence =
                    recurrence === "all" ||
                    (recurrence === "recurring" && income.recurrence === "Recurring") ||
                    (recurrence === "one-time" && income.recurrence === "One-time");
                return matchesTimeframe && matchesRecurrence;
            }),
        [entries, recurrence, timeframe]
    );

    const totals = useMemo(() => {
        const total = filteredEntries.reduce((sum, income) => sum + income.amount, 0);
        const recurring = filteredEntries
            .filter((income) => income.recurrence === "Recurring")
            .reduce((sum, income) => sum + income.amount, 0);
        const nextDate = filteredEntries
            .map((income) => (income.nextPayout ? new Date(income.nextPayout) : null))
            .filter((date): date is Date => Boolean(date) && !Number.isNaN(date.getTime()))
            .sort((a, b) => a.getTime() - b.getTime())[0];

        return {
            total,
            recurring,
            nextDate,
        };
    }, [filteredEntries]);

    const fetchIncomes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/incomes", { cache: "no-store" });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Unable to load incomes.");
            setEntries(Array.isArray(body?.data) ? body.data : []);
        } catch (error) {
            console.error(error);
            setEntries(incomeSeed);
            toast.error("Could not load incomes", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIncomes();
    }, [fetchIncomes]);

    const handleAddIncome = () => {
        setFormMode("create");
        setEditableIncome(null);
        setSelectedIncome(null);
        setFormOpen(true);
    };

    const handleEditIncome = (income: IncomeRecord) => {
        setFormMode("edit");
        setEditableIncome(income);
        setSelectedIncome(income);
        setFormOpen(true);
    };

    const handleDeleteIncome = (income: IncomeRecord) => {
        setDeleteTarget(income);
    };

    const confirmDeleteIncome = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/incomes/${deleteTarget.id}`, { method: "DELETE" });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Failed to delete income.");

            setEntries((prev) => prev.filter((entry) => entry.id !== deleteTarget.id));
            if (selectedIncome?.id === deleteTarget.id) setSelectedIncome(null);
            toast.success("Income removed");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to remove income");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    const handleSubmitIncome = async (values: IncomeFormValues) => {
        const payload = {
            ...values,
            amount: Number(values.amount),
            nextPayout: values.recurrence === "Recurring" ? values.nextPayout : "",
        };
        const isEdit = formMode === "edit" && editableIncome;
        const endpoint = isEdit ? `/api/incomes/${editableIncome?.id}` : "/api/incomes";
        const method = isEdit ? "PATCH" : "POST";

        try {
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Unable to save income.");
            const saved = body?.data as IncomeRecord;
            if (isEdit && editableIncome) {
                setEntries((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
                setSelectedIncome(saved);
            } else {
                setEntries((prev) => [saved, ...prev]);
            }
            setFormOpen(false);
            setEditableIncome(null);
            toast.success(isEdit ? "Income updated" : "Income added");
        } catch {
            toast.error(isEdit ? "Unable to update income" : "Unable to add income");
        }
    };

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 px-6 py-8 shadow-lg shadow-black/5 md:px-8">
                <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />

                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <LightbulbIcon className="h-4 w-4" aria-hidden />
                            Manage you finances
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
                                Confident inflow tracking
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                                Monitor recurring inflows, time-bound payouts, and coverage in one refined
                                table. Filter by cadence and horizon to stay ready.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                Guardrails on
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Actionable insights
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Finance ready
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-primary/40 bg-primary/10 text-primary shadow-sm hover:bg-primary/20"
                            onClick={handleAddIncome}
                        >
                            <Plus className="h-4 w-4" aria-hidden />
                            Add income
                        </Button>
                    </div>
                </div>
            </section>

            <IncomeFilters
                timeframe={timeframe}
                recurrence={recurrence}
                onTimeframeChange={setTimeframe}
                onRecurrenceChange={setRecurrence}
                onReset={fetchIncomes}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Filtered inflow
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-foreground">
                                {formatCurrency(totals.total)}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <PiggyBank className="h-5 w-5" aria-hidden />
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sum of income inside the active filters.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Recurring coverage
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-foreground">
                                {formatCurrency(totals.recurring)}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ShieldCheck className="h-5 w-5" aria-hidden />
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Reliable inflow you can allocate with confidence.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Next payout
                            </p>
                            <p className="mt-2 text-xl font-semibold text-foreground">
                                {totals.nextDate ? formatDate(totals.nextDate.toISOString()) : "—"}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Clock3 className="h-5 w-5" aria-hidden />
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Soonest scheduled inflow within your filters.
                    </p>
                </div>
            </div>

            <IncomeTable
                data={filteredEntries}
                onView={setSelectedIncome}
                onEdit={handleEditIncome}
                onDelete={handleDeleteIncome}
            />

            <IncomeDetailsSheet income={selectedIncome} onClose={() => setSelectedIncome(null)} />
            <IncomeFormSheet
                open={formOpen}
                mode={formMode}
                income={editableIncome}
                onClose={() => {
                    setFormOpen(false);
                    setEditableIncome(null);
                }}
                onSubmit={handleSubmitIncome}
            />

            <Dialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open && !deleteLoading) setDeleteTarget(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete income?</DialogTitle>
                        <DialogDescription>
                            This action cannot be reversed. The income record will be removed permanently.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
                        <p className="font-semibold text-foreground">{deleteTarget?.source}</p>
                        <p className="text-muted-foreground">{deleteTarget?.category}</p>
                        <p className="mt-1 text-muted-foreground">
                            Amount {formatCurrency(deleteTarget?.amount ?? 0)} — Next payout{" "}
                            {deleteTarget?.nextPayout ? formatDate(deleteTarget.nextPayout) : "Not scheduled"}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={deleteLoading}
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleteLoading}
                            onClick={confirmDeleteIncome}
                        >
                            {deleteLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                    Deleting...
                                </span>
                            ) : (
                                "Delete income"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

function isWithinTimeframe(dateInput: string, timeframe: TimeframeFilter) {
    if (timeframe === "all") return true;

    const target = new Date(dateInput);
    if (Number.isNaN(target.getTime())) return false;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);

    const isSameMonth = target.getMonth() === currentMonth && target.getFullYear() === currentYear;
    const isLastMonth =
        target.getMonth() === lastMonthDate.getMonth() &&
        target.getFullYear() === lastMonthDate.getFullYear();

    if (timeframe === "this-month") return isSameMonth;
    if (timeframe === "last-month") return isLastMonth;

    if (timeframe === "year") return target.getFullYear() === currentYear;

    if (timeframe === "quarter") {
        const quarter = Math.floor(currentMonth / 3);
        const quarterStartMonth = quarter * 3;
        const quarterEndMonth = quarterStartMonth + 2;
        return (
            target.getFullYear() === currentYear &&
            target.getMonth() >= quarterStartMonth &&
            target.getMonth() <= quarterEndMonth
        );
    }

    return true;
}

export default IncomePage;
