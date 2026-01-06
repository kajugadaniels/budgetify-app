import { Prisma, TransactionMethod, TransactionStatus, type Transaction } from "@prisma/client";
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
    method: TransactionMethod;
    status: TransactionStatus;
    note?: string | null;
    budgetId?: string | null;
    goalId?: string | null;
};

const methodLabels: Record<TransactionMethod, TransactionRecord["method"]> = {
    [TransactionMethod.CARD]: "Card",
    [TransactionMethod.CASH]: "Cash",
    [TransactionMethod.TRANSFER]: "Transfer",
    [TransactionMethod.MOBILE]: "Mobile",
};

const statusLabels: Record<TransactionStatus, TransactionRecord["status"]> = {
    [TransactionStatus.CLEARED]: "Cleared",
    [TransactionStatus.PENDING]: "Pending",
    [TransactionStatus.FLAGGED]: "Flagged",
};

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

export function serializeTransaction(txn: Transaction): TransactionRecord {
    return {
        id: txn.id,
        merchant: txn.merchant,
        category: txn.category,
        amount: Number(txn.amount ?? 0),
        date: txn.date instanceof Date ? txn.date.toISOString() : txn.date,
        account: txn.account,
        method: methodLabels[txn.method],
        status: statusLabels[txn.status],
        note: txn.note ?? undefined,
        goalId: txn.goalId ?? undefined,
    };
}

export function parseTransactionPayload(payload: unknown) {
    if (!payload || typeof payload !== "object") {
        return { error: "Invalid payload." };
    }

    const input = payload as Record<string, unknown>;
    const errors: string[] = [];

    const merchant = typeof input.merchant === "string" ? input.merchant.trim() : "";
    const category = typeof input.category === "string" ? input.category.trim() : "";
    const account = typeof input.account === "string" ? input.account.trim() : "";
    const methodInput = typeof input.method === "string" ? input.method : "Card";
    const statusInput = typeof input.status === "string" ? input.status : "Cleared";
    const method: ParsedTransaction["method"] =
        methodInput === "Cash" || methodInput === "CASH"
            ? TransactionMethod.CASH
            : methodInput === "Transfer" || methodInput === "TRANSFER"
                ? TransactionMethod.TRANSFER
                : methodInput === "Mobile" || methodInput === "MOBILE"
                    ? TransactionMethod.MOBILE
                    : TransactionMethod.CARD;
    const status: ParsedTransaction["status"] =
        statusInput === "Pending" || statusInput === "PENDING"
            ? TransactionStatus.PENDING
            : statusInput === "Flagged" || statusInput === "FLAGGED"
                ? TransactionStatus.FLAGGED
                : TransactionStatus.CLEARED;

    const date = typeof input.date === "string" ? input.date : "";
    const amountNumber = Number(input.amount);
    const note = typeof input.note === "string" ? input.note.trim() : undefined;
    const budgetId =
        input.budgetId && typeof input.budgetId === "string" && input.budgetId.length
            ? input.budgetId
            : null;
    const goalId =
        input.goalId && typeof input.goalId === "string" && input.goalId.length
            ? input.goalId
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
