export type TimeframeFilter = "this-month" | "last-month" | "quarter" | "year" | "all";

export type RecurrenceFilter = "all" | "recurring" | "one-time";

export type IncomeRecord = {
    id: string;
    source: string;
    category: string;
    recurrence: "Recurring" | "One-time";
    cadence: string;
    nextPayout: string; // ISO date
    amount: number;
    note?: string;
    account?: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    return dateFormatter.format(date);
};
