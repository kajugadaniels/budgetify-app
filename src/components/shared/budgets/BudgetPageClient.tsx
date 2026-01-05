"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LightbulbIcon, Plus, Target, Wallet, Wallet2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BudgetFilters, BudgetFormValues, BudgetRecord, formatCurrency } from "./types";
import BudgetFiltersPanel from "./BudgetFilters";
import BudgetTable from "./BudgetTable";
import BudgetDetailsSheet from "./BudgetDetailsSheet";
import BudgetFormSheet from "./BudgetFormSheet";

const seedBudgets: BudgetRecord[] = [
    {
        id: "bud-001",
        name: "Housing",
        category: "Living",
        amount: 1800,
        spent: 1450,
        month: 1,
        year: 2025,
        note: "Rent and utilities coverage.",
    },
    {
        id: "bud-002",
        name: "Groceries",
        category: "Living",
        amount: 650,
        spent: 410,
        month: 1,
        year: 2025,
        note: "Whole foods and markets.",
    },
    {
        id: "bud-003",
        name: "Investing",
        category: "Wealth",
        amount: 1200,
        spent: 1200,
        month: 1,
        year: 2025,
        note: "Brokerage + retirement contributions.",
    },
];

export default function BudgetPageClient() {
    const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
    const [filters, setFilters] = useState<BudgetFilters>({
        search: "",
        category: "",
        month: undefined,
        year: new Date().getFullYear(),
    });
    const [selectedBudget, setSelectedBudget] = useState<BudgetRecord | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editableBudget, setEditableBudget] = useState<BudgetRecord | null>(null);
    const [loading, setLoading] = useState(true);

    const filteredBudgets = useMemo(() => {
        return budgets.filter((budget) => {
            const matchesSearch =
                !filters.search ||
                budget.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                budget.note?.toLowerCase().includes(filters.search.toLowerCase());
            const matchesCategory =
                !filters.category ||
                budget.category.toLowerCase().includes(filters.category.toLowerCase());
            const matchesMonth = !filters.month || budget.month === filters.month;
            const matchesYear = !filters.year || budget.year === filters.year;
            return matchesSearch && matchesCategory && matchesMonth && matchesYear;
        });
    }, [budgets, filters]);

    const totals = useMemo(() => {
        const planned = filteredBudgets.reduce((sum, b) => sum + b.amount, 0);
        const spent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
        const remaining = planned - spent;
        return { planned, spent, remaining };
    }, [filteredBudgets]);

    const fetchBudgets = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.category) params.set("category", filters.category);
        if (filters.month) params.set("month", String(filters.month));
        if (filters.year) params.set("year", String(filters.year));

        try {
            const response = await fetch(`/api/budgets?${params.toString()}`, {
                cache: "no-store",
            });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Unable to load budgets.");
            setBudgets(Array.isArray(body?.data) ? body.data : []);
        } catch (error) {
            console.error(error);
            setBudgets(seedBudgets);
            toast.error("Could not load budgets", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void fetchBudgets();
    }, [fetchBudgets]);

    const handleAdd = () => {
        setFormMode("create");
        setEditableBudget(null);
        setSelectedBudget(null);
        setFormOpen(true);
    };

    const handleEdit = (budget: BudgetRecord) => {
        setFormMode("edit");
        setEditableBudget(budget);
        setSelectedBudget(budget);
        setFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        const promise = (async () => {
            const response = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Failed to delete budget.");
            return id;
        })();

        toast.promise(promise, {
            loading: "Removing budget...",
            success: "Budget removed",
            error: (error) => error.message ?? "Unable to remove budget",
        });

        try {
            await promise;
            setBudgets((prev) => prev.filter((item) => item.id !== id));
            if (selectedBudget?.id === id) setSelectedBudget(null);
        } catch {
            // toast covers errors
        }
    };

    const handleSubmit = async (values: BudgetFormValues) => {
        const isEdit = formMode === "edit" && editableBudget;
        const endpoint = isEdit ? `/api/budgets/${editableBudget?.id}` : "/api/budgets";
        const method = isEdit ? "PATCH" : "POST";

        const promise = (async () => {
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Unable to save budget.");
            return body?.data as BudgetRecord;
        })();

        toast.promise(promise, {
            loading: isEdit ? "Saving changes..." : "Adding budget...",
            success: isEdit ? "Budget updated" : "Budget added",
            error: (error) => error.message ?? "Something went wrong",
        });

        try {
            const saved = await promise;
            if (isEdit && editableBudget) {
                setBudgets((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
                setSelectedBudget(saved);
            } else {
                setBudgets((prev) => [saved, ...prev]);
            }
            setFormOpen(false);
            setEditableBudget(null);
        } catch {
            // toast covers errors
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
                            Guardrails ready
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
                                Confident budget control
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                                Track planned vs. actual spend, across categories and periods. Filter
                                and act fast when allocations drift.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                Allocations aligned
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Signal driven
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Focused spend
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-primary/40 bg-primary/10 text-primary shadow-sm hover:bg-primary/20"
                            onClick={handleAdd}
                        >
                            <Plus className="h-4 w-4" aria-hidden />
                            Add budget
                        </Button>
                    </div>
                </div>
            </section>

            <BudgetFiltersPanel
                initial={filters}
                onApply={(next) => setFilters(next)}
                onReset={fetchBudgets}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Planned
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-foreground">
                                {formatCurrency(totals.planned)}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Wallet2 className="h-5 w-5" aria-hidden />
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Total planned allocations in view.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Spent
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-foreground">
                                {formatCurrency(totals.spent)}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Target className="h-5 w-5" aria-hidden />
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Amount consumed across visible budgets.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Remaining
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-foreground">
                                {formatCurrency(totals.remaining)}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <LightbulbIcon className="h-5 w-5" aria-hidden />
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Cushion left to deploy or reallocate.
                    </p>
                </div>
            </div>

            <BudgetTable data={filteredBudgets} onView={setSelectedBudget} onEdit={handleEdit} onDelete={handleDelete} />

            <BudgetDetailsSheet budget={selectedBudget} onClose={() => setSelectedBudget(null)} />
            <BudgetFormSheet
                open={formOpen}
                mode={formMode}
                initialValues={
                    editableBudget
                        ? {
                              name: editableBudget.name,
                              category: editableBudget.category,
                              amount: editableBudget.amount,
                              spent: editableBudget.spent,
                              month: editableBudget.month,
                              year: editableBudget.year,
                              note: editableBudget.note ?? "",
                          }
                        : undefined
                }
                onClose={() => {
                    setFormOpen(false);
                    setEditableBudget(null);
                }}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
