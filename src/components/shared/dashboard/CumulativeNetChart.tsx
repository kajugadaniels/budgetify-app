"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type NetDatum = {
    day: number;
    net: number;
};

type CumulativeNetChartProps = {
    data: NetDatum[];
    loading?: boolean;
};

const currencyFormatter = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "RWF",
        maximumFractionDigits: 0,
    }).format(value);

const CumulativeNetChart = ({ data, loading = false }: CumulativeNetChartProps) => {
    if (loading) {
        return <Skeleton className="h-[320px] w-full rounded-2xl" />;
    }

    if (!data.length) {
        return (
            <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/80 text-sm text-muted-foreground">
                No activity in this period.
            </div>
        );
    }

    return (
        <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis
                        tickFormatter={(value) => currencyFormatter(value)}
                        tick={{ fontSize: 12 }}
                        width={80}
                    />
                    <Tooltip
                        formatter={(value) => currencyFormatter(typeof value === "number" ? value : 0)}
                        labelFormatter={(label) => `Day ${label}`}
                        contentStyle={{ borderRadius: 12 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="net"
                        name="Cumulative net"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#netGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export type { NetDatum };
export default CumulativeNetChart;
