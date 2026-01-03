"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import IncomeTable from "./income-table";
import IncomeFilterSheet, { IncomeFilters } from "./income-filter-sheet";
import IncomeFormSheet, { IncomeFormValues } from "./income-form-sheet";
import IncomeDetailSheet from "./income-detail-sheet";

export type IncomeRecord = {
    id: string;
    amount: number;
    month: number;
    year: number;
    note?: string | null;
    createdAt: string;
    updatedAt: string;
};

type Props = {
    initialIncomes: IncomeRecord[];
};

async function fetchIncomes(filters: IncomeFilters) {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.month) params.set("month", String(filters.month));
    if (filters.year) params.set("year", String(filters.year));

    const res = await fetch(`/api/income?${params.toString()}`, {
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to load incomes.");
    }
    return (await res.json()) as IncomeRecord[];
}

async function createIncome(data: IncomeFormValues) {
    const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const payload = await res.json();
    if (!res.ok) {
        throw new Error(payload?.error || "Unable to create income.");
    }
    return payload as IncomeRecord;
}

async function updateIncome(id: string, data: IncomeFormValues) {
    const res = await fetch(`/api/income/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const payload = await res.json();
    if (!res.ok) {
        throw new Error(payload?.error || "Unable to update income.");
    }
    return payload as IncomeRecord;
}

async function getIncome(id: string) {
    const res = await fetch(`/api/income/${id}`, { cache: "no-store" });
    const payload = await res.json();
    if (!res.ok) {
        throw new Error(payload?.error || "Unable to load income.");
    }
    return payload as IncomeRecord;
}

const currentYear = new Date().getFullYear();

export default function IncomePageClient({ initialIncomes }: Props) {
    const [incomes, setIncomes] = useState<IncomeRecord[]>(initialIncomes);
    const [filters, setFilters] = useState<IncomeFilters>({
        search: "",
        month: undefined,
        year: currentYear,
    });
    const [isFilterOpen, setFilterOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
    const [detailIncome, setDetailIncome] = useState<IncomeRecord | null>(null);
    const [isPending, startTransition] = useTransition();

    const loadIncomes = useCallback(
        (nextFilters: IncomeFilters = filters) => {
            startTransition(async () => {
                try {
                    const data = await fetchIncomes(nextFilters);
                    setIncomes(data);
                    setFilters(nextFilters);
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to load incomes.");
                }
            });
        },
        [filters]
    );

    const handleApplyFilters = (next: IncomeFilters) => {
        setFilterOpen(false);
        loadIncomes(next);
    };

    const handleResetFilters = () => {
        const reset: IncomeFilters = { search: "", month: undefined, year: undefined };
        setFilterOpen(false);
        loadIncomes(reset);
    };

    const handleSubmitForm = async (values: IncomeFormValues) => {
        startTransition(async () => {
            try {
                if (editingIncome) {
                    await updateIncome(editingIncome.id, values);
                    toast.success("Income updated.");
                } else {
                    await createIncome(values);
                    toast.success("Income added.");
                }
                setFormOpen(false);
                setEditingIncome(null);
                loadIncomes(filters);
            } catch (error: unknown) {
                console.error(error);
                toast.error(
                    error instanceof Error ? error.message : "Unable to save income."
                );
            }
        });
    };

    const handleView = async (id: string) => {
        startTransition(async () => {
            try {
                const item = await getIncome(id);
                setDetailIncome(item);
                setDetailOpen(true);
            } catch (error) {
                console.error(error);
                toast.error("Unable to load income details.");
            }
        });
    };

    const months = useMemo(
        () => [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ],
        []
    );

    return (
        <>
            <IncomeTable
                incomes={incomes}
                months={months}
                isLoading={isPending}
                onOpenFilters={() => setFilterOpen(true)}
                onAdd={() => {
                    setEditingIncome(null);
                    setFormOpen(true);
                }}
                onEdit={(income) => {
                    setEditingIncome(income);
                    setFormOpen(true);
                }}
                onView={(income) => handleView(income.id)}
                onRefresh={() => loadIncomes(filters)}
            />

            <IncomeFilterSheet
                open={isFilterOpen}
                onClose={() => setFilterOpen(false)}
                initialFilters={filters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />

            <IncomeFormSheet
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingIncome(null);
                }}
                mode={editingIncome ? "edit" : "create"}
                initialValues={
                    editingIncome
                        ? {
                              amount: editingIncome.amount,
                              month: editingIncome.month,
                              year: editingIncome.year,
                              note: editingIncome.note ?? "",
                          }
                        : undefined
                }
                onSubmit={handleSubmitForm}
            />

            <IncomeDetailSheet
                open={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setDetailIncome(null);
                }}
                income={detailIncome}
                months={months}
            />
        </>
    );
}
