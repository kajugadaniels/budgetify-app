"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Sparkles, Wallet2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BudgetFormValues, formatCurrency, monthLabels } from "./types";

type Props = {
    open: boolean;
    mode: "create" | "edit";
    initialValues?: BudgetFormValues;
    onClose: () => void;
    onSubmit: (values: BudgetFormValues) => Promise<void>;
};

const now = new Date();
const defaults: BudgetFormValues = {
    name: "",
    category: "General",
    amount: 0,
    spent: 0,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    note: "",
};

export default function BudgetFormSheet({
    open,
    mode,
    initialValues,
    onClose,
    onSubmit,
}: Props) {
    const [values, setValues] = useState<BudgetFormValues>(defaults);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isCreate = mode === "create";
    const isValid =
        values.name.trim() &&
        Number.isFinite(values.amount) &&
        values.amount > 0 &&
        Number.isFinite(values.month) &&
        Number.isFinite(values.year);

    useEffect(() => {
        if (open) {
            setValues(initialValues ? { ...initialValues } : defaults);
            setIsSubmitting(false);
        }
    }, [initialValues, open]);

    const headerSummary = useMemo(() => {
        const planned = formatCurrency(Number(values.amount) || 0);
        const spent = formatCurrency(Number(values.spent ?? 0));
        return { planned, spent };
    }, [values.amount, values.spent]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!isValid || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const trimmedNote = values.note?.trim() ?? "";
            await onSubmit({
                ...values,
                name: values.name.trim(),
                category: values.category?.trim() || "General",
                amount: Number(values.amount),
                spent: Number(values.spent ?? 0),
                note: trimmedNote.length ? trimmedNote : undefined,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="flex h-full w-full max-w-xl flex-col border-l border-border/60 bg-card/95 px-6 py-6 shadow-2xl shadow-black/25 transition-transform duration-200 ease-out"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                            {isCreate ? "Add budget" : "Edit budget"}
                        </p>
                        <h3 className="text-2xl font-semibold text-foreground">
                            {isCreate ? "Shape a new guardrail" : values.name || "Update budget"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            One streamlined form for creating or editing budget allocations.
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
                        <X className="h-4 w-4" aria-hidden />
                    </Button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-primary">
                            Planned (RWF)
                            <Wallet2 className="h-4 w-4" aria-hidden />
                        </div>
                        <p className="mt-2 text-xl font-semibold text-foreground">
                            {headerSummary.planned}
                        </p>
                        <p className="text-xs text-muted-foreground">Guardrail per period</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Spent (RWF)
                            <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                            {headerSummary.spent}
                        </p>
                        <p className="text-xs text-muted-foreground">Include actuals to date</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/10 via-card to-background px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Period
                            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                            {monthLabels[(values.month || 1) - 1]} {values.year}
                        </p>
                        <p className="text-xs text-muted-foreground">Where this budget applies</p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-inner shadow-black/5"
                >
                    <div className="grid gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-foreground">
                                Name (required)
                            </Label>
                            <Input
                                value={values.name}
                                onChange={(e) =>
                                    setValues((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="Housing, Food, Savings"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-foreground">
                                Category (optional)
                            </Label>
                            <Input
                                value={values.category}
                                onChange={(e) =>
                                    setValues((prev) => ({ ...prev, category: e.target.value }))
                                }
                                placeholder="General, Living, Growth"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-foreground">
                                    Planned amount (required, RWF)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={values.amount}
                                    onChange={(e) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            amount: Number(e.target.value),
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-foreground">
                                    Spent to date (optional, RWF)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={values.spent ?? 0}
                                    onChange={(e) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            spent: Number(e.target.value),
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-foreground">
                            Month (required)
                        </Label>
                        <Select
                            value={String(values.month)}
                            onValueChange={(value) =>
                                setValues((prev) => ({
                                    ...prev,
                                    month: Number.parseInt(value, 10),
                                }))
                            }
                        >
                            <SelectTrigger className="h-11 w-full rounded-xl border-border/60 bg-background/70">
                                <SelectValue placeholder="Choose month" />
                            </SelectTrigger>
                            <SelectContent align="start">
                                {monthLabels.map((label, idx) => (
                                    <SelectItem key={label} value={String(idx + 1)}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-foreground">
                                    Year (required)
                                </Label>
                                <Input
                                    type="number"
                                    min={2000}
                                    value={values.year}
                                    onChange={(e) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            year: Number.parseInt(e.target.value, 10),
                                        }))
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-foreground">
                                Notes (optional)
                            </Label>
                            <textarea
                                value={values.note ?? ""}
                                onChange={(e) =>
                                    setValues((prev) => ({ ...prev, note: e.target.value }))
                                }
                                rows={3}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                placeholder="Add context or guardrails"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting || !isValid}>
                            {isSubmitting
                                ? isCreate
                                    ? "Adding..."
                                    : "Saving..."
                                : isCreate
                                  ? "Add budget"
                                  : "Save changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
