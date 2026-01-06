"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, Sparkles, Wallet2 } from "lucide-react";
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
    TransactionFormValues,
    TransactionRecord,
    defaultTransactionFormValues,
    formatCurrency,
    formatDate,
} from "./types";

type TransactionFormSheetProps = {
    open: boolean;
    mode: "create" | "edit";
    transaction: TransactionRecord | null;
    onClose: () => void;
    onSubmit: (values: TransactionFormValues) => Promise<void>;
    loading?: boolean;
};

const methodOptions: TransactionRecord["method"][] = ["Card", "Cash", "Transfer", "Mobile"];
const statusOptions: TransactionRecord["status"][] = ["Cleared", "Pending", "Flagged"];
const categoryOptions = ["General", "Living", "Work", "Travel", "Personal", "Other"];

const TransactionFormSheet = ({
    open,
    mode,
    transaction,
    onClose,
    onSubmit,
    loading = false,
}: TransactionFormSheetProps) => {
    const [values, setValues] = useState<TransactionFormValues>(defaultTransactionFormValues());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isCreate = mode === "create";

    useMemo(() => {
        if (!transaction) {
            setValues(defaultTransactionFormValues());
            return;
        }
        setValues({
            merchant: transaction.merchant,
            category: transaction.category,
            amount: transaction.amount,
            date: transaction.date.slice(0, 10),
            account: transaction.account,
            method: transaction.method,
            status: transaction.status,
            note: transaction.note ?? "",
        });
    }, [transaction]);

    if (!open) return null;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting || loading) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...values,
                amount: Number(values.amount),
                merchant: values.merchant.trim(),
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
                                    {isCreate ? "Add transaction" : "Edit transaction"}
                                </p>
                                <h3 className="text-2xl font-semibold text-foreground">
                                    {isCreate ? "Log a new transaction" : transaction?.merchant}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    One refined form for capture and updates.
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
                            Amount (RWF)
                            <Wallet2 className="h-4 w-4" aria-hidden />
                        </div>
                        {loading ? (
                            <>
                                <Skeleton className="mt-2 h-6 w-24 rounded" />
                                <Skeleton className="h-3 w-20 rounded" />
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
                            Date
                            <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        {loading ? (
                            <>
                                <Skeleton className="mt-2 h-4 w-28 rounded" />
                                <Skeleton className="h-3 w-32 rounded" />
                            </>
                        ) : (
                            <>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {formatDate(values.date)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Track when cash leaves your account.
                                </p>
                            </>
                        )}
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/10 via-card to-background px-4 py-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Method
                            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        {loading ? (
                            <Skeleton className="mt-2 h-4 w-20 rounded" />
                        ) : (
                            <>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {values.method}
                                </p>
                                <p className="text-xs text-muted-foreground">Channel used to pay</p>
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
                            {[...Array(7)].map((_, index) => (
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
                                    Merchant
                                </Label>
                                <Input
                                    className="h-11 rounded-xl border-border/60 bg-background/70"
                                    placeholder="e.g., Kigali Market"
                                    value={values.merchant}
                                    onChange={(event) =>
                                        setValues((prev) => ({ ...prev, merchant: event.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Category
                                </Label>
                                <Select
                                    value={values.category}
                                    onValueChange={(value) =>
                                        setValues((prev) => ({ ...prev, category: value }))
                                    }
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
                            <div className="grid gap-4 md:grid-cols-2">
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
                                        Date
                                    </Label>
                                    <Input
                                        type="date"
                                        className="h-11 rounded-xl border-border/60 bg-background/70"
                                        value={values.date}
                                        onChange={(event) =>
                                            setValues((prev) => ({ ...prev, date: event.target.value }))
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        Account
                                    </Label>
                                    <Input
                                        className="h-11 rounded-xl border-border/60 bg-background/70"
                                        placeholder="e.g., Checking • 2841"
                                        value={values.account}
                                        onChange={(event) =>
                                            setValues((prev) => ({ ...prev, account: event.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        Method
                                    </Label>
                                    <Select
                                        value={values.method}
                                        onValueChange={(value) =>
                                            setValues((prev) => ({ ...prev, method: value as TransactionRecord["method"] }))
                                        }
                                    >
                                        <SelectTrigger className="h-11 w-full rounded-xl border-border/60 bg-background/70">
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent align="start">
                                            {methodOptions.map((option) => (
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
                                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        Status
                                    </Label>
                                    <Select
                                        value={values.status}
                                        onValueChange={(value) =>
                                            setValues((prev) => ({ ...prev, status: value as TransactionRecord["status"] }))
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
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 bg-card/90 px-1 py-4">
                        <Button type="submit" className="min-w-[140px]" disabled={isSubmitting || loading}>
                            {isSubmitting
                                ? isCreate
                                    ? "Adding..."
                                    : "Saving..."
                                : isCreate
                                  ? "Add transaction"
                                  : "Save changes"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Your updates will mirror across table and detail view.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionFormSheet;
