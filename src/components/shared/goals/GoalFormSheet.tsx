"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Sparkles, Target, Wallet2 } from "lucide-react";
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
import {
    GoalFormValues,
    GoalRecord,
    defaultGoalFormValues,
    formatCurrency,
    formatDate,
} from "./types";

type GoalFormSheetProps = {
    open: boolean;
    mode: "create" | "edit";
    goal: GoalRecord | null;
    onClose: () => void;
    onSubmit: (values: GoalFormValues) => Promise<void>;
    loading?: boolean;
};

const statusOptions: GoalRecord["status"][] = ["Planning", "Active", "Completed", "Paused"];

const GoalFormSheet = ({
    open,
    mode,
    goal,
    onClose,
    onSubmit,
    loading = false,
}: GoalFormSheetProps) => {
    const [values, setValues] = useState<GoalFormValues>(defaultGoalFormValues());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isCreate = mode === "create";

    useEffect(() => {
        if (!goal) {
            setValues(defaultGoalFormValues());
            return;
        }
        setValues({
            name: goal.name,
            amount: goal.amount,
            status: goal.status,
            targetDate: goal.targetDate ?? "",
            note: goal.note ?? "",
        });
    }, [goal]);

    if (!open) return null;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting || loading) return;
        if (!values.name.trim() || !values.amount || values.amount <= 0) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...values,
                amount: Number(values.amount),
                name: values.name.trim(),
                note: values.note?.trim() || "",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        {loading ? (
                            <>
                                <Skeleton className="h-3 w-24 rounded" />
                                <Skeleton className="h-6 w-48 rounded" />
                                <Skeleton className="h-4 w-60 rounded" />
                            </>
                        ) : (
                            <>
                                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                    {isCreate ? "Add goal" : "Edit goal"}
                                </p>
                                <h3 className="text-2xl font-semibold text-foreground">
                                    {isCreate ? "Set a new objective" : goal?.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Capture target, status, and timeline in one form.
                                </p>
                            </>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={loading}
                    >
                        ✕
                    </Button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-primary">
                            Target (RWF)
                            <Wallet2 className="h-4 w-4" aria-hidden />
                        </div>
                        {loading ? (
                            <>
                                <Skeleton className="mt-2 h-6 w-24 rounded" />
                                <Skeleton className="h-3 w-24 rounded" />
                            </>
                        ) : (
                            <>
                                <p className="mt-2 text-xl font-semibold text-foreground">
                                    {formatCurrency(values.amount || 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">{values.status}</p>
                            </>
                        )}
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Target date
                            <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        {loading ? (
                            <>
                                <Skeleton className="mt-2 h-4 w-32 rounded" />
                                <Skeleton className="h-3 w-40 rounded" />
                            </>
                        ) : (
                            <>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {values.targetDate ? formatDate(values.targetDate) : "Not set"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Choose a date to keep pace.
                                </p>
                            </>
                        )}
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/10 via-card to-background px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Status
                            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        {loading ? (
                            <Skeleton className="mt-2 h-4 w-24 rounded" />
                        ) : (
                            <>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {values.status}
                                </p>
                                <p className="text-xs text-muted-foreground">Track momentum</p>
                            </>
                        )}
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-inner shadow-black/5"
                >
                    {loading ? (
                        <div className="grid gap-4">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton className="h-3 w-24 rounded" />
                                    <Skeleton className="h-11 rounded-xl border border-border/60" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Name
                                </Label>
                                <Input
                                    className="h-11 rounded-xl border-border/60 bg-background/70"
                                    placeholder="e.g., Emergency fund"
                                    value={values.name}
                                    onChange={(event) =>
                                        setValues((prev) => ({ ...prev, name: event.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Amount
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="h-11 rounded-xl border-border/60 bg-background/70"
                                    value={values.amount}
                                    onChange={(event) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            amount: Number(event.target.value),
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Target date
                                </Label>
                                <Input
                                    type="date"
                                    className="h-11 rounded-xl border-border/60 bg-background/70"
                                    value={values.targetDate}
                                    onChange={(event) =>
                                        setValues((prev) => ({ ...prev, targetDate: event.target.value }))
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional—helps visualize timelines.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Status
                                </Label>
                                <Select
                                    value={values.status}
                                    onValueChange={(value) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            status: value as GoalRecord["status"],
                                        }))
                                    }
                                >
                                    <SelectTrigger className="h-11 w-full rounded-xl border-border/60 bg-background/70">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Notes
                                </Label>
                                <Input
                                    className="h-11 rounded-xl border-border/60 bg-background/70"
                                    placeholder="Optional notes"
                                    value={values.note}
                                    onChange={(event) =>
                                        setValues((prev) => ({ ...prev, note: event.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 bg-card/90 px-1 py-4">
                        <Button type="submit" className="min-w-[140px]" disabled={isSubmitting || loading}>
                            {isSubmitting
                                ? isCreate
                                    ? "Adding..."
                                    : "Saving..."
                                : isCreate
                                  ? "Add goal"
                                  : "Save changes"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Goals inform planning and optional transaction links.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoalFormSheet;
