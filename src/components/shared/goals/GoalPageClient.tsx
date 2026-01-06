"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Flag, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import GoalTable from "./GoalTable";
import GoalDetailsSheet from "./GoalDetailsSheet";
import GoalFormSheet from "./GoalFormSheet";
import { GoalFormValues, GoalRecord, formatCurrency, formatDate } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function GoalPageClient() {
    const [goals, setGoals] = useState<GoalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<GoalRecord | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editable, setEditable] = useState<GoalRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GoalRecord | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const totals = useMemo(() => {
        const planned = goals.reduce((sum, goal) => sum + goal.amount, 0);
        const active = goals.filter((g) => g.status === "Active").reduce((sum, g) => sum + g.amount, 0);
        const completed = goals.filter((g) => g.status === "Completed").reduce((sum, g) => sum + g.amount, 0);
        return { planned, active, completed };
    }, [goals]);

    const fetchGoals = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/goals", { cache: "no-store" });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Unable to load goals.");
            setGoals(Array.isArray(body?.data) ? body.data : []);
        } catch (error) {
            console.error(error);
            toast.error("Could not load goals", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchGoals();
    }, [fetchGoals]);

    const handleAdd = () => {
        setFormMode("create");
        setEditable(null);
        setSelected(null);
        setFormOpen(true);
    };

    const handleEdit = (goal: GoalRecord) => {
        setFormMode("edit");
        setEditable(goal);
        setSelected(goal);
        setFormOpen(true);
    };

    const handleDelete = (goal: GoalRecord) => {
        setDeleteTarget(goal);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/goals/${deleteTarget.id}`, { method: "DELETE" });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Failed to delete goal.");
            setGoals((prev) => prev.filter((goal) => goal.id !== deleteTarget.id));
            if (selected?.id === deleteTarget.id) setSelected(null);
            toast.success("Goal removed");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to remove goal");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    const handleSubmit = async (values: GoalFormValues) => {
        const isEdit = formMode === "edit" && editable;
        const endpoint = isEdit ? `/api/goals/${editable?.id}` : "/api/goals";
        const method = isEdit ? "PATCH" : "POST";

        try {
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error ?? "Unable to save goal.");
            const saved = body?.data as GoalRecord;
            if (isEdit && editable) {
                setGoals((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
                setSelected(saved);
            } else {
                setGoals((prev) => [saved, ...prev]);
            }
            setFormOpen(false);
            setEditable(null);
            toast.success(isEdit ? "Goal updated" : "Goal added");
        } catch {
            toast.error(isEdit ? "Unable to update goal" : "Unable to add goal");
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
                            <Sparkles className="h-4 w-4" aria-hidden />
                            Goal tracking
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
                                Purposeful goals, visible progress
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                                Capture targets, status, and timelines. Link transactions optionally to
                                track real-world movement.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                Outcomes first
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Transparent status
                            </span>
                            <span className="rounded-full bg-foreground/5 px-3 py-1">
                                Optional linking
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-primary/40 bg-primary/10 text-primary shadow-sm hover:bg-primary/20"
                            onClick={handleAdd}
                        >
                            <Plus className="h-4 w-4" aria-hidden />
                            Add goal
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Total target
                            </p>
                            {loading ? (
                                <Skeleton className="mt-2 h-8 w-32 rounded" />
                            ) : (
                                <p className="mt-2 text-3xl font-semibold text-foreground">
                                    {formatCurrency(totals.planned)}
                                </p>
                            )}
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Flag className="h-5 w-5" aria-hidden />
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sum of all goal targets in view.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Active goals
                            </p>
                            {loading ? (
                                <Skeleton className="mt-2 h-8 w-32 rounded" />
                            ) : (
                                <p className="mt-2 text-3xl font-semibold text-foreground">
                                    {formatCurrency(totals.active)}
                                </p>
                            )}
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Targets currently in motion.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Completed
                            </p>
                            {loading ? (
                                <Skeleton className="mt-2 h-8 w-32 rounded" />
                            ) : (
                                <p className="mt-2 text-3xl font-semibold text-foreground">
                                    {formatCurrency(totals.completed)}
                                </p>
                            )}
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Achievements to celebrate.
                    </p>
                </div>
            </div>

            <GoalTable
                data={goals}
                loading={loading}
                onView={setSelected}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <GoalDetailsSheet
                goal={selected}
                loading={loading && Boolean(selected)}
                onClose={() => setSelected(null)}
            />
            <GoalFormSheet
                open={formOpen}
                mode={formMode}
                goal={editable}
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
                        <DialogTitle>Delete goal?</DialogTitle>
                        <DialogDescription>
                            This action cannot be reversed. The goal will be removed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
                        <p className="font-semibold text-foreground">{deleteTarget?.name}</p>
                        <p className="text-muted-foreground">
                            Target {formatCurrency(deleteTarget?.amount ?? 0)} — Status{" "}
                            {deleteTarget?.status ?? "Planning"}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                            Target date {deleteTarget?.targetDate ? formatDate(deleteTarget.targetDate) : "Not set"}
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
                                "Delete goal"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
