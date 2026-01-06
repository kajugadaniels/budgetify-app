"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, ReceiptText, Wallet2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BudgetRecord, BudgetTransaction, formatCurrency, monthLabels } from "./types";
import { Switch } from "@/components/ui/switch";

type Props = {
    budget: BudgetRecord | null;
    open: boolean;
    onClose: () => void;
    onCreated: (payload: { budget: BudgetRecord; transaction: BudgetTransaction }) => void;
};

type FormState = {
    merchant: string;
    amount: number;
    date: string;
    note: string;
    account: string;
    category: string;
    method: "Card" | "Cash" | "Transfer" | "Mobile";
    status: "Cleared" | "Pending" | "Flagged";
    addToGoal: boolean;
};

const defaultFormState = (): FormState => ({
    merchant: "",
    amount: 0,
    date: "",
    note: "",
    account: "Budget account",
    category: "General",
    method: "Card",
    status: "Cleared",
    addToGoal: false,
});

export default function BudgetTransactionSheet({ budget, open, onClose, onCreated }: Props) {
    const [form, setForm] = useState<FormState>(defaultFormState());
    const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const totals = useMemo(() => {
        const existing = transactions.reduce((sum, txn) => sum + txn.amount, 0);
        const pending = Number(form.amount) || 0;
        const planned = budget?.amount ?? 0;
        const remaining = planned - existing - pending;
        return { planned, existing, pending, remaining };
    }, [budget?.amount, form.amount, transactions]);

    useEffect(() => {
        if (!open || !budget) return;
        setForm(defaultFormState());
        setSaving(false);
        setLoading(true);

        fetch(`/api/budgets/${budget.id}/transactions`, { cache: "no-store" })
            .then((res) => res.json().catch(() => null).then((body) => ({ ok: res.ok, body })))
            .then(({ ok, body }) => {
                if (!ok) throw new Error(body?.error ?? "Unable to load transactions.");
                setTransactions(Array.isArray(body?.data?.transactions) ? body.data.transactions : []);
            })
            .catch((error) => {
                toast.error(error instanceof Error ? error.message : "Unable to load transactions");
                setTransactions([]);
            })
            .finally(() => setLoading(false));
    }, [budget, open]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!budget || saving) return;

        if (!form.merchant.trim() || !form.amount || form.amount <= 0) {
            toast.error("Merchant and amount greater than zero are required.");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`/api/budgets/${budget.id}/transactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    merchant: form.merchant.trim(),
                    category: form.category || budget.category,
                    account: form.account,
                    method: form.method,
                    status: form.status,
                    amount: Number(form.amount),
                    date: form.date,
                    note: form.note.trim(),
                    addToGoal: form.addToGoal,
                }),
            });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Unable to add transaction.");

            const created = body?.data?.transaction as BudgetTransaction;
            const updatedBudget = body?.data?.budget as BudgetRecord;
            setTransactions((prev) => [created, ...prev]);
            onCreated({ budget: updatedBudget, transaction: created });
            toast.success("Transaction added");
            onClose();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to add transaction right now."
            );
        } finally {
            setSaving(false);
        }
    };

    if (!budget) return null;

    return (
        <Dialog open={open} onOpenChange={(next) => !saving && !loading && !next && onClose()}>
            <DialogContent className="top-0 right-0 left-auto h-full max-w-xl translate-x-0 translate-y-0 rounded-none border-l bg-card sm:rounded-l-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <ReceiptText className="h-5 w-5 text-primary" aria-hidden />
                        Add transaction
                    </DialogTitle>
                    <DialogDescription>
                        Log spend against <span className="font-semibold text-foreground">{budget.name}</span>.
                        Remaining updates as you type.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Planned</p>
                            <p className="text-xl font-semibold text-foreground">
                        {formatCurrency(totals.planned)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {monthLabels[(budget.month || 1) - 1]} {budget.year}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Remaining</p>
                            <p
                                className={`text-xl font-semibold ${
                                    totals.remaining < 0 ? "text-destructive" : "text-foreground"
                                }`}
                            >
                                {formatCurrency(totals.remaining)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Spent {formatCurrency(totals.existing + totals.pending)}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                Also track as goal
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Creates a completed goal using this transaction data.
                            </p>
                        </div>
                        <Switch
                            checked={form.addToGoal}
                            onCheckedChange={(checked) =>
                                setForm((prev) => ({ ...prev, addToGoal: checked }))
                            }
                            aria-label="Toggle create goal"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Merchant</Label>
                            <Input
                                value={form.merchant}
                                onChange={(e) => setForm((prev) => ({ ...prev, merchant: e.target.value }))}
                                placeholder="e.g., Utilities payment"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Amount (RWF)</Label>
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.amount}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))
                                }
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Date (optional)</Label>
                            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
                                <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
                                <Input
                                    type="date"
                                    className="border-0 px-0"
                                    value={form.date}
                                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Defaults to today if empty.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Note (optional)</Label>
                            <Input
                                value={form.note}
                                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                                placeholder="Add context"
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Account</Label>
                            <Input
                                value={form.account}
                                onChange={(e) => setForm((prev) => ({ ...prev, account: e.target.value }))}
                                placeholder="e.g., Checking • 2841"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Category</Label>
                            <Input
                                value={form.category}
                                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                                placeholder="Defaults to budget category"
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Method</Label>
                            <select
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                                value={form.method}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, method: e.target.value as FormState["method"] }))
                                }
                            >
                                <option>Card</option>
                                <option>Cash</option>
                                <option>Transfer</option>
                                <option>Mobile</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Status</Label>
                            <select
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                                value={form.status}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, status: e.target.value as FormState["status"] }))
                                }
                            >
                                <option>Cleared</option>
                                <option>Pending</option>
                                <option>Flagged</option>
                            </select>
                        </div>
                    </div>
                </form>

                <DialogFooter>
                    <Button type="button" variant="outline" disabled={saving || loading} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" disabled={saving || loading} onClick={handleSubmit}>
                        {saving ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                Saving...
                            </span>
                        ) : (
                            "Add transaction"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
