"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LightbulbIcon, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import TransactionTable from "./TransactionTable";
import TransactionDetailsSheet from "./TransactionDetailsSheet";
import TransactionFormSheet from "./TransactionFormSheet";
import {
    TransactionFormValues,
    TransactionRecord,
    formatCurrency,
    formatDate,
} from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function TransactionPageClient() {
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [selected, setSelected] = useState<TransactionRecord | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editable, setEditable] = useState<TransactionRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<TransactionRecord | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const totals = useMemo(() => {
        const total = transactions.reduce((sum, txn) => sum + txn.amount, 0);
        const cleared = transactions
            .filter((txn) => txn.status === "Cleared")
            .reduce((sum, txn) => sum + txn.amount, 0);
        const pending = transactions
            .filter((txn) => txn.status === "Pending")
            .reduce((sum, txn) => sum + txn.amount, 0);
        return { total, cleared, pending };
    }, [transactions]);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/transactions", { cache: "no-store" });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Unable to load transactions.");
            setTransactions(Array.isArray(body?.data) ? body.data : []);
        } catch (error) {
            console.error(error);
            toast.error("Could not load transactions", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchTransactions();
    }, [fetchTransactions]);

    const handleAdd = () => {
        setFormMode("create");
        setEditable(null);
        setSelected(null);
        setFormOpen(true);
    };

    const handleEdit = (txn: TransactionRecord) => {
        setFormMode("edit");
        setEditable(txn);
        setSelected(txn);
        setFormOpen(true);
    };

    const handleDelete = (txn: TransactionRecord) => {
        setDeleteTarget(txn);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/transactions/${deleteTarget.id}`, { method: "DELETE" });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Failed to delete transaction.");
            setTransactions((prev) => prev.filter((item) => item.id !== deleteTarget.id));
            if (selected?.id === deleteTarget.id) setSelected(null);
            toast.success("Transaction removed");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to remove transaction");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    const handleSubmit = async (values: TransactionFormValues) => {
        const isEdit = formMode === "edit" && editable;
        const endpoint = isEdit ? `/api/transactions/${editable?.id}` : "/api/transactions";
        const method = isEdit ? "PATCH" : "POST";

        try {
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Unable to save transaction.");
            const saved = body?.data as TransactionRecord;
            if (isEdit && editable) {
                setTransactions((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
                setSelected(saved);
            } else {
                setTransactions((prev) => [saved, ...prev]);
            }
            setFormOpen(false);
            setEditable(null);
            toast.success(isEdit ? "Transaction updated" : "Transaction added");
        } catch {
            toast.error(isEdit ? "Unable to update transaction" : "Unable to add transaction");
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
                            Transaction controls
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
                                Clear, auditable spend
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                                Review every inflow and outflow with actionable context. View, edit, or
                                remove entries without losing the thread.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                Audit-ready
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Fast editing
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Detail-rich
                            </span>
                        </div>
                    </div>
                    {/* <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-primary/40 bg-primary/10 text-primary shadow-sm hover:bg-primary/20"
                            onClick={handleAdd}
                        >
                            <Plus className="h-4 w-4" aria-hidden />
                            Add transaction
                        </Button>
                    </div> */}
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Total volume
                            </p>
                            {loading ? (
                                <Skeleton className="mt-2 h-8 w-32 rounded" />
                            ) : (
                                <p className="mt-2 text-3xl font-semibold text-foreground">
                                    {formatCurrency(totals.total)}
                                </p>
                            )}
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        All transactions currently in view.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Cleared
                            </p>
                            {loading ? (
                                <Skeleton className="mt-2 h-8 w-32 rounded" />
                            ) : (
                                <p className="mt-2 text-3xl font-semibold text-foreground">
                                    {formatCurrency(totals.cleared)}
                                </p>
                            )}
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Amount fully posted to accounts.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Pending
                            </p>
                            {loading ? (
                                <Skeleton className="mt-2 h-8 w-32 rounded" />
                            ) : (
                                <p className="mt-2 text-3xl font-semibold text-foreground">
                                    {formatCurrency(totals.pending)}
                                </p>
                            )}
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Items awaiting settlement or review.
                    </p>
                </div>
            </div>

            <TransactionTable
                data={transactions}
                loading={loading}
                onView={setSelected}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <TransactionDetailsSheet
                transaction={selected}
                loading={loading && Boolean(selected)}
                onClose={() => setSelected(null)}
            />
            <TransactionFormSheet
                open={formOpen}
                mode={formMode}
                transaction={editable}
                onClose={() => {
                    setFormOpen(false);
                    setEditable(null);
                }}
                onSubmit={handleSubmit}
                loading={loading}
            />

            <Dialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open && !deleteLoading) setDeleteTarget(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete transaction?</DialogTitle>
                        <DialogDescription>
                            This action cannot be reversed. The transaction will be removed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
                        <p className="font-semibold text-foreground">{deleteTarget?.merchant}</p>
                        <p className="text-muted-foreground">{deleteTarget?.category}</p>
                        <p className="mt-1 text-muted-foreground">
                            Amount {formatCurrency(deleteTarget?.amount ?? 0)} — Date{" "}
                            {deleteTarget?.date ? formatDate(deleteTarget.date) : "Not set"}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={deleteLoading}
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleteLoading}
                            onClick={confirmDelete}
                        >
                            {deleteLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                    Deleting...
                                </span>
                            ) : (
                                "Delete transaction"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
