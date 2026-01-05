"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { IncomeFormValues, defaultIncomeFormValues } from "./types";

type IncomeFormProps = {
    mode: "create" | "edit";
    initialValues?: IncomeFormValues;
    onSubmit: (values: IncomeFormValues) => void;
    onCancel: () => void;
};

const categoryOptions = ["Salary", "Consulting", "Investments", "Bonus", "Other"];
const recurrenceOptions: IncomeFormValues["recurrence"][] = ["Recurring", "One-time"];

const inputClass =
    "w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm text-foreground shadow-inner shadow-black/5 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground";

const IncomeForm = ({ mode, initialValues, onSubmit, onCancel }: IncomeFormProps) => {
    const [values, setValues] = useState<IncomeFormValues>(
        initialValues ?? defaultIncomeFormValues()
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setValues(initialValues ?? defaultIncomeFormValues());
    }, [initialValues]);

    const isCreate = useMemo(() => mode === "create", [mode]);

    const handleChange = (field: keyof IncomeFormValues, value: string) => {
        setError(null);
        if (field === "amount") {
            const numericValue = Number(value);
            setValues((prev) => ({ ...prev, amount: Number.isNaN(numericValue) ? 0 : numericValue }));
            return;
        }

        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!values.source.trim() || !values.cadence.trim() || !values.nextPayout) {
            setError("Source, cadence, and payout date are required.");
            return;
        }
        if (!values.amount || Number.isNaN(values.amount) || values.amount <= 0) {
            setError("Enter a valid amount greater than zero.");
            return;
        }

        onSubmit(values);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className={labelClass} htmlFor="source">
                        Source
                    </label>
                    <input
                        id="source"
                        name="source"
                        className={inputClass}
                        placeholder="e.g., Atlas Corp — Base Salary"
                        value={values.source}
                        onChange={(event) => handleChange("source", event.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className={labelClass} htmlFor="amount">
                        Amount
                    </label>
                    <input
                        id="amount"
                        name="amount"
                        type="number"
                        min="0"
                        step="50"
                        className={inputClass}
                        placeholder="0"
                        value={values.amount}
                        onChange={(event) => handleChange("amount", event.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className={labelClass} htmlFor="category">
                        Category
                    </label>
                    <select
                        id="category"
                        name="category"
                        className={inputClass}
                        value={values.category}
                        onChange={(event) => handleChange("category", event.target.value)}
                    >
                        {categoryOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className={labelClass} htmlFor="recurrence">
                        Recurrence
                    </label>
                    <select
                        id="recurrence"
                        name="recurrence"
                        className={inputClass}
                        value={values.recurrence}
                        onChange={(event) => handleChange("recurrence", event.target.value)}
                    >
                        {recurrenceOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className={labelClass} htmlFor="cadence">
                        Cadence
                    </label>
                    <input
                        id="cadence"
                        name="cadence"
                        className={inputClass}
                        placeholder="e.g., Monthly · 28th"
                        value={values.cadence}
                        onChange={(event) => handleChange("cadence", event.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className={labelClass} htmlFor="nextPayout">
                        Next payout
                    </label>
                    <input
                        id="nextPayout"
                        name="nextPayout"
                        type="date"
                        className={inputClass}
                        value={values.nextPayout}
                        onChange={(event) => handleChange("nextPayout", event.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className={labelClass} htmlFor="account">
                        Deposit account
                    </label>
                    <input
                        id="account"
                        name="account"
                        className={inputClass}
                        placeholder="e.g., Checking • 2841"
                        value={values.account}
                        onChange={(event) => handleChange("account", event.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className={labelClass} htmlFor="note">
                        Notes
                    </label>
                    <input
                        id="note"
                        name="note"
                        className={inputClass}
                        placeholder="Optional context or reminders"
                        value={values.note}
                        onChange={(event) => handleChange("note", event.target.value)}
                    />
                </div>
            </div>

            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" className="min-w-[140px]">
                    {isCreate ? "Add income" : "Save changes"}
                </Button>
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <p className="text-xs text-muted-foreground">
                    Your updates will reflect across the table and detail view.
                </p>
            </div>
        </form>
    );
};

export default IncomeForm;
