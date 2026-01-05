export type BudgetRecord = {
    id: string;
    name: string;
    category: string;
    amount: number;
    spent: number;
    month: number;
    year: number;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type BudgetFormValues = {
    name: string;
    category: string;
    amount: number;
    spent?: number;
    month: number;
    year: number;
    note?: string;
};

export type BudgetFilters = {
    search?: string;
    category?: string;
    month?: number;
    year?: number;
};

export type BudgetTransaction = {
    id: string;
    budgetId: string;
    name: string;
    amount: number;
    date: string;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
