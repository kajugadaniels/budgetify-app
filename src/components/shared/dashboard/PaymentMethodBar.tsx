"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type MethodDatum = {
    name: string;
    value: number;
};

type PaymentMethodBarProps = {
    data: MethodDatum[];
    loading?: boolean;
};

const currencyFormatter = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "RWF",
        maximumFractionDigits: 0,
    }).format(value);

const PaymentMethodBar = ({ data, loading = false }: PaymentMethodBarProps) => {
    if (loading) {
        return <Skeleton className="h-[320px] w-full rounded-2xl" />;
    }

    if (!data.length || data.every((item) => item.value === 0)) {
        return (
            <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/80 text-sm text-muted-foreground">
                No transactions in this period.
            </div>
        );
    }

    return (
        <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis
                        tickFormatter={(value) => currencyFormatter(value)}
                        tick={{ fontSize: 12 }}
                        width={80}
                    />
                    <Tooltip
                        formatter={(value: number) => currencyFormatter(value)}
                        contentStyle={{ borderRadius: 12 }}
                    />
                    <Bar dataKey="value" name="Amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export type { MethodDatum };
export default PaymentMethodBar;
