export type TransactionRecord = {
    id: string;
    merchant: string;
    category: string;
    amount: number;
    date: string; // ISO date
    account: string;
    method: "Card" | "Cash" | "Transfer" | "Mobile";
    status: "Cleared" | "Pending" | "Flagged";
    note?: string;
    goalId?: string;
};

export type TransactionFormValues = {
    merchant: string;
    category: string;
    amount: number;
    date: string;
    account: string;
    method: TransactionRecord["method"];
    status: TransactionRecord["status"];
    note?: string;
    goalId?: string;
};

export const defaultTransactionFormValues = (): TransactionFormValues => ({
    merchant: "",
    category: "General",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    account: "Primary account",
    method: "Card",
    status: "Cleared",
    note: "",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatDate = (isoDate?: string | null) => {
    if (!isoDate) return "—";
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    return dateFormatter.format(date);
};
