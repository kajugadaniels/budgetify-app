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

export type IncomeFormValues = {
    source: string;
    category: string;
    recurrence: IncomeRecord["recurrence"];
    cadence: string;
    nextPayout: string;
    amount: number;
    note: string;
    account: string;
};

export const defaultIncomeFormValues = (): IncomeFormValues => ({
    source: "",
    category: "Salary",
    recurrence: "Recurring",
    cadence: "",
    nextPayout: new Date().toISOString().slice(0, 10),
    amount: 0,
    note: "",
    account: "",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RWF",
    currencyDisplay: "code",
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
