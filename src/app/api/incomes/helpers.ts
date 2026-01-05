import { Prisma } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IncomeRecord } from "@/components/shared/income/types";

type ParsedIncome = {
    source: string;
    category: string;
    recurrence: "Recurring" | "One-time";
    cadence: string;
    nextPayout: Date;
    amount: Prisma.Decimal;
    note?: string | null;
    account?: string | null;
    day?: number | null;
    month?: number | null;
    year?: number | null;
};

export function serializeIncome(income: any): IncomeRecord {
    return {
        id: income.id,
        source: income.source,
        category: income.category,
        recurrence: income.recurrence === "ONE_TIME" ? "One-time" : "Recurring",
        cadence: income.cadence,
        nextPayout: income.nextPayout instanceof Date
            ? income.nextPayout.toISOString()
            : income.nextPayout,
        amount: Number(income.amount ?? 0),
        note: income.note ?? undefined,
        account: income.account ?? undefined,
    };
}

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

export function parseIncomePayload(payload: any) {
    if (!payload || typeof payload !== "object") {
        return { error: "Invalid payload." };
    }

    const errors: string[] = [];

    const source = typeof payload.source === "string" ? payload.source.trim() : "";
    const category = typeof payload.category === "string" ? payload.category.trim() : "";
    const cadence = typeof payload.cadence === "string" ? payload.cadence.trim() : "";
    const recurrence = payload.recurrence === "One-time" ? "One-time" : "Recurring";
    const nextPayout = typeof payload.nextPayout === "string" ? payload.nextPayout : "";
    const note = typeof payload.note === "string" ? payload.note.trim() : undefined;
    const account = typeof payload.account === "string" ? payload.account.trim() : undefined;
    const amountNumber = Number(payload.amount);

    if (!source) errors.push("Source is required.");
    if (!category) errors.push("Category is required.");
    if (!cadence) errors.push("Cadence is required.");
    if (!nextPayout) errors.push("Next payout date is required.");
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        errors.push("Amount must be greater than zero.");
    }

    const parsedDate = new Date(nextPayout);
    if (Number.isNaN(parsedDate.getTime())) errors.push("Next payout must be a valid date.");

    if (errors.length) {
        return { error: errors.join(" ") };
    }

    const parsed: ParsedIncome = {
        source,
        category,
        recurrence,
        cadence,
        nextPayout: parsedDate,
        amount: new Prisma.Decimal(amountNumber),
        note: note || null,
        account: account || null,
        day: parsedDate.getDate(),
        month: parsedDate.getMonth() + 1,
        year: parsedDate.getFullYear(),
    };

    return { data: parsed };
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequestResponse(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
}

export function notFoundResponse(message = "Income not found") {
    return NextResponse.json({ error: message }, { status: 404 });
}
