"use client";

import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Line,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type FlowDatum = {
    day: number;
    income: number;
    spend: number;
};

type MonthlyFlowChartProps = {
    data: FlowDatum[];
    loading?: boolean;
};

const currencyFormatter = (value: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
}).format(value);

const MonthlyFlowChart = ({ data, loading = false }: MonthlyFlowChartProps) => {
    if (loading) {
        return <Skeleton className="h-[320px] w-full rounded-2xl" />;
    }

    return (
        <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
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
                    <Legend />
                    <Bar dataKey="spend" name="Spend" fill="#f97316" radius={[6, 6, 0, 0]} />
                    <Line dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export type { FlowDatum };
export default MonthlyFlowChart;
