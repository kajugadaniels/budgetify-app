"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryDatum = {
    name: string;
    value: number;
};

type CategoryBreakdownPieProps = {
    data: CategoryDatum[];
    loading?: boolean;
};

const palette = ["#f97316", "#10b981", "#6366f1", "#facc15", "#ef4444", "#3b82f6", "#a855f7"];

const currencyFormatter = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "RWF",
        maximumFractionDigits: 0,
    }).format(value);

const CategoryBreakdownPie = ({ data, loading = false }: CategoryBreakdownPieProps) => {
    if (loading) {
        return <Skeleton className="h-[320px] w-full rounded-2xl" />;
    }

    if (!data.length) {
        return (
            <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/80 text-sm text-muted-foreground">
                No transactions in this period.
            </div>
        );
    }

    return (
        <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label={({ name, percent }) =>
                            `${name}: ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                        }
                    >
                        {data.map((entry, index) => (
                            <Cell key={entry.name} fill={palette[index % palette.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => currencyFormatter(value)}
                        contentStyle={{ borderRadius: 12 }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export type { CategoryDatum };
export default CategoryBreakdownPie;
