export type GoalRecord = {
    id: string;
    name: string;
    amount: number;
    status: "Planning" | "Active" | "Completed" | "Paused";
    targetDate?: string | null;
    note?: string;
};

export type GoalFormValues = {
    name: string;
    amount: number;
    status: GoalRecord["status"];
    targetDate?: string;
    note?: string;
};

export const defaultGoalFormValues = (): GoalFormValues => ({
    name: "",
    amount: 0,
    status: "Planning",
    targetDate: "",
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
