"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BudgetFormValues } from "./types";

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

    useEffect(() => {
        if (open) {
            setValues(initialValues ? { ...initialValues } : defaults);
            setIsSubmitting(false);
        }
    }, [initialValues, open]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...values,
                amount: Number(values.amount),
                spent: Number(values.spent ?? 0),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/30"
                    onClick={onClose}
                    aria-hidden
                />
            )}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg transform border-l border-border/60 bg-card/95 shadow-xl backdrop-blur transition-transform duration-300 ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
                aria-hidden={!open}
            >
                <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            {mode === "create" ? "Add budget" : "Edit budget"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Keep planned spend aligned with income.
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>

                <div className="space-y-4 px-6 py-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Name</label>
                        <input
                            value={values.name}
                            onChange={(e) =>
                                setValues((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="e.g., Housing, Food, Savings"
                            className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Category
                        </label>
                        <input
                            value={values.category}
                            onChange={(e) =>
                                setValues((prev) => ({ ...prev, category: e.target.value }))
                            }
                            placeholder="Category"
                            className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Planned amount
                            </label>
                            <input
                                type="number"
                                value={values.amount}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        amount: Number(e.target.value),
                                    }))
                                }
                                className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Spent (optional)
                            </label>
                            <input
                                type="number"
                                value={values.spent ?? 0}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        spent: Number(e.target.value),
                                    }))
                                }
                                className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Month
                            </label>
                            <select
                                value={values.month}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        month: Number.parseInt(e.target.value, 10),
                                    }))
                                }
                                className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            >
                                {Array.from({ length: 12 }).map((_, idx) => (
                                    <option key={idx + 1} value={idx + 1}>
                                        {idx + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Year
                            </label>
                            <input
                                type="number"
                                value={values.year}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        year: Number.parseInt(e.target.value, 10),
                                    }))
                                }
                                className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Note</label>
                        <textarea
                            value={values.note ?? ""}
                            onChange={(e) =>
                                setValues((prev) => ({ ...prev, note: e.target.value }))
                            }
                            rows={3}
                            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            placeholder="Add context or guardrails"
                        />
                    </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border/60 px-6 py-4">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
                        {mode === "create" ? "Add budget" : "Save changes"}
                    </Button>
                </div>
            </aside>
        </>
    );
}
