"use client";

import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
    title: string;
    value: string;
    hint: string;
    icon?: React.ReactNode;
    loading?: boolean;
};

const StatCard = ({ title, value, hint, icon, loading = false }: StatCardProps) => {
    return (
        <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {title}
                    </p>
                    {loading ? (
                        <Skeleton className="mt-2 h-8 w-28 rounded" />
                    ) : (
                        <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
                    )}
                </div>
                {icon ? <div className="text-primary">{icon}</div> : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
    );
};

export default StatCard;
