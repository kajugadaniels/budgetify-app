import { Prisma } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionRecord } from "@/components/shared/transactions/types";

type ParsedTransaction = {
    merchant: string;
    category: string;
    amount: Prisma.Decimal;
    date: Date;
    account: string;
    method: "Card" | "Cash" | "Transfer" | "Mobile";
    status: "Cleared" | "Pending" | "Flagged";
    note?: string | null;
    budgetId?: string | null;
    goalId?: string | null;
};

const methodMap = {
    Card: "CARD",
    Cash: "CASH",
    Transfer: "TRANSFER",
    Mobile: "MOBILE",
} as const;

const statusMap = {
    Cleared: "CLEARED",
    Pending: "PENDING",
    Flagged: "FLAGGED",
} as const;

export async function resolveAuthenticatedUser() {
    const user = await currentUser();
    if (!user) return null;

    const primaryEmail =
        user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
            ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    const dbUser = await prisma.user.upsert({
        where: { clerkId: user.id },
        update: {
            email: primaryEmail ?? undefined,
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
            phone: user.phoneNumbers[0]?.phoneNumber ?? undefined,
        },
        create: {
            clerkId: user.id,
            email: primaryEmail ?? `${user.id}@example.com`,
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
            phone: user.phoneNumbers[0]?.phoneNumber ?? undefined,
        },
    });

    return dbUser;
}

export function serializeTransaction(txn: any): TransactionRecord {
    return {
        id: txn.id,
        merchant: txn.merchant,
        category: txn.category,
        amount: Number(txn.amount ?? 0),
        date: txn.date instanceof Date ? txn.date.toISOString() : txn.date,
        account: txn.account,
        method: txn.method === "CASH" ? "Cash"
            : txn.method === "TRANSFER" ? "Transfer"
                : txn.method === "MOBILE" ? "Mobile"
                    : "Card",
        status: txn.status === "PENDING" ? "Pending" : txn.status === "FLAGGED" ? "Flagged" : "Cleared",
        note: txn.note ?? undefined,
        goalId: txn.goalId ?? undefined,
    };
}

export function parseTransactionPayload(payload: any) {
    if (!payload || typeof payload !== "object") {
        return { error: "Invalid payload." };
    }

    const errors: string[] = [];

    const merchant = typeof payload.merchant === "string" ? payload.merchant.trim() : "";
    const category = typeof payload.category === "string" ? payload.category.trim() : "";
    const account = typeof payload.account === "string" ? payload.account.trim() : "";
    const method: ParsedTransaction["method"] =
        payload.method === "Cash"
            ? "Cash"
            : payload.method === "Transfer"
                ? "Transfer"
                : payload.method === "Mobile"
                    ? "Mobile"
                    : "Card";
    const status: ParsedTransaction["status"] =
        payload.status === "Pending"
            ? "Pending"
            : payload.status === "Flagged"
                ? "Flagged"
                : "Cleared";

    const date = typeof payload.date === "string" ? payload.date : "";
    const amountNumber = Number(payload.amount);
    const note = typeof payload.note === "string" ? payload.note.trim() : undefined;
    const budgetId =
        payload.budgetId && typeof payload.budgetId === "string" && payload.budgetId.length
            ? payload.budgetId
            : null;
    const goalId =
        payload.goalId && typeof payload.goalId === "string" && payload.goalId.length
            ? payload.goalId
            : null;

    if (!merchant) errors.push("Merchant is required.");
    if (!category) errors.push("Category is required.");
    if (!account) errors.push("Account is required.");
    if (!date) errors.push("Date is required.");
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        errors.push("Amount must be greater than zero.");
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) errors.push("Date must be valid.");

    if (errors.length) return { error: errors.join(" ") };

    const parsed: ParsedTransaction = {
        merchant,
        category,
        amount: new Prisma.Decimal(amountNumber),
        date: parsedDate,
        account,
        method,
        status,
        note: note || null,
        budgetId,
        goalId,
    };

    return { data: parsed };
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequestResponse(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
}

export function notFoundResponse(message = "Transaction not found") {
    return NextResponse.json({ error: message }, { status: 404 });
}
