"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { IncomeFormValues, defaultIncomeFormValues } from "./types";
import { cn } from "@/lib/utils";

type IncomeFormProps = {
    mode: "create" | "edit";
    initialValues?: IncomeFormValues;
    onSubmit: (values: IncomeFormValues) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
    className?: string;
    loading?: boolean;
};

const categoryOptions = ["Salary", "Consulting", "Investments", "Bonus", "Other"];
const recurrenceOptions: IncomeFormValues["recurrence"][] = ["Recurring", "One-time"];

const IncomeForm = ({
    mode,
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
    className,
    loading = false,
}: IncomeFormProps) => {
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

        if (field === "recurrence") {
            setValues((prev) => ({
                ...prev,
                recurrence: value as IncomeFormValues["recurrence"],
                nextPayout: value === "Recurring" ? prev.nextPayout : "",
            }));
            return;
        }

        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;
        if (!values.source.trim() || !values.cadence.trim() || !values.paidOn) {
            setError("Source, cadence, and date received are required.");
            return;
        }
        if (values.recurrence === "Recurring" && !values.nextPayout) {
            setError("Next payout date is required for recurring incomes.");
            return;
        }
        if (!values.amount || Number.isNaN(values.amount) || values.amount <= 0) {
            setError("Enter a valid amount greater than zero.");
            return;
        }

        await onSubmit(values);
    };

    if (loading) {
        return (
            <form className={cn("flex h-full flex-col", className)}>
                <div className="flex-1 space-y-5 overflow-y-auto pr-1">
                    {[...Array(7)].map((_, index) => (
                        <div key={index} className="space-y-2">
                            <Skeleton className="h-3 w-24 rounded" />
                            <Skeleton className="h-11 rounded-xl border border-border/60" />
                        </div>
                    ))}
                    <Skeleton className="h-3 w-32 rounded" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 bg-card/90 px-1 py-4">
                    <Skeleton className="h-10 w-[140px] rounded-md" />
                    <Skeleton className="h-10 w-20 rounded-md" />
                    <Skeleton className="h-3 w-64 rounded" />
                </div>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={cn("flex h-full flex-col", className)}>
            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label
                            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            htmlFor="source"
                        >
                            Source
                        </Label>
                        <Input
                            id="source"
                            name="source"
                            className="h-11 rounded-xl border-border/60 bg-background/70"
                            placeholder="e.g., Atlas Corp - Base Salary"
                            value={values.source}
                            onChange={(event) => handleChange("source", event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            htmlFor="amount"
                        >
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            min="0"
                            step="50"
                            className="h-11 rounded-xl border-border/60 bg-background/70"
                            placeholder="0"
                            value={values.amount}
                            onChange={(event) => handleChange("amount", event.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label
                            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            htmlFor="category"
                        >
                            Category
                        </Label>
                        <Select
                            value={values.category}
                            onValueChange={(value) => handleChange("category", value)}
                        >
                            <SelectTrigger className="h-11 w-full rounded-xl border-border/60 bg-background/70">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent align="start">
                                {categoryOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label
                            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            htmlFor="recurrence"
                        >
                            Recurrence
                        </Label>
                        <Select
                            value={values.recurrence}
                            onValueChange={(value) => handleChange("recurrence", value)}
                        >
                            <SelectTrigger className="h-11 w-full rounded-xl border-border/60 bg-background/70">
                                <SelectValue placeholder="Select recurrence" />
                            </SelectTrigger>
                            <SelectContent align="start">
                                {recurrenceOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label
                            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            htmlFor="cadence"
                        >
                            Cadence
                        </Label>
                        <Input
                            id="cadence"
                            name="cadence"
                            className="h-11 rounded-xl border-border/60 bg-background/70"
                            placeholder="e.g., Monthly - 28th"
                            value={values.cadence}
                            onChange={(event) => handleChange("cadence", event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            htmlFor="nextPayout"
                        >
                            Next payout
                        </Label>
                        <Input
                            id="nextPayout"
                            name="nextPayout"
                            type="date"
                            className="h-11 rounded-xl border-border/60 bg-background/70"
                            value={values.nextPayout}
                            onChange={(event) => handleChange("nextPayout", event.target.value)}
                            required={values.recurrence === "Recurring"}
                            disabled={values.recurrence === "One-time"}
                        />
                        <p className="text-xs text-muted-foreground">
                            Required for recurring incomes; leave blank for one-time.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label
                            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            htmlFor="account"
                        >
                            Deposit account
                        </Label>
                        <Input
                            id="account"
                            name="account"
                            className="h-11 rounded-xl border-border/60 bg-background/70"
                            placeholder="e.g., Checking - 2841"
                            value={values.account}
                            onChange={(event) => handleChange("account", event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                            htmlFor="paidOn"
                        >
                            Date received
                        </Label>
                        <Input
                            id="paidOn"
                            name="paidOn"
                            type="date"
                            className="h-11 rounded-xl border-border/60 bg-background/70"
                            value={values.paidOn}
                            onChange={(event) => handleChange("paidOn", event.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label
                        className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                        htmlFor="note"
                    >
                        Notes
                    </Label>
                    <Input
                        id="note"
                        name="note"
                        className="h-11 rounded-xl border-border/60 bg-background/70"
                        placeholder="Optional context or reminders"
                        value={values.note}
                        onChange={(event) => handleChange("note", event.target.value)}
                    />
                </div>

                {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 bg-card/90 px-1 py-4">
                <Button type="submit" className="min-w-[140px]" disabled={isSubmitting}>
                    {isSubmitting
                        ? isCreate
                            ? "Adding..."
                            : "Saving..."
                        : isCreate
                          ? "Add income"
                          : "Save changes"}
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
