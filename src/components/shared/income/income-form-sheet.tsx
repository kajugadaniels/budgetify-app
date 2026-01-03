"use client";

import { useEffect, useState } from "react";

export type IncomeFormValues = {
    amount: number | string;
    month: number;
    year: number;
    note?: string;
};

type Props = {
    open: boolean;
    mode: "create" | "edit";
    initialValues?: IncomeFormValues;
    onClose: () => void;
    onSubmit: (values: IncomeFormValues) => Promise<void>;
};

const now = new Date();
const defaultValues: IncomeFormValues = {
    amount: "",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    note: "",
};

export default function IncomeFormSheet({
    open,
    mode,
    initialValues,
    onClose,
    onSubmit,
}: Props) {
    const [values, setValues] = useState<IncomeFormValues>(defaultValues);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setValues(initialValues ? { ...initialValues } : defaultValues);
            setIsSubmitting(false);
        }
    }, [initialValues, open]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit({
            ...values,
            amount:
                typeof values.amount === "string"
                    ? Number.parseFloat(values.amount)
                    : values.amount,
        });
        setIsSubmitting(false);
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
                            {mode === "create" ? "Add income" : "Edit income"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Capture monthly earnings.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
                <div className="space-y-4 px-6 py-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={values.amount}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    amount: e.target.value,
                                }))
                            }
                            className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            placeholder="0.00"
                        />
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
                        <label className="text-sm font-medium text-foreground">
                            Note
                        </label>
                        <textarea
                            value={values.note ?? ""}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    note: e.target.value,
                                }))
                            }
                            rows={3}
                            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            placeholder="e.g., Salary, freelance, bonus"
                        />
                    </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border/60 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                        {mode === "create" ? "Add income" : "Save changes"}
                    </button>
                </div>
            </aside>
        </>
    );
}
