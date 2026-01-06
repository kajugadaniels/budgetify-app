import { Prisma } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoalRecord } from "@/components/shared/goals/types";

type ParsedGoal = {
    name: string;
    amount: Prisma.Decimal;
    status: "Planning" | "Active" | "Completed" | "Paused";
    targetDate: Date | null;
    note?: string | null;
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

export function serializeGoal(goal: any): GoalRecord {
    return {
        id: goal.id,
        name: goal.name,
        amount: Number(goal.amount ?? 0),
        status:
            goal.status === "ACTIVE"
                ? "Active"
                : goal.status === "COMPLETED"
                    ? "Completed"
                    : goal.status === "PAUSED"
                        ? "Paused"
                        : "Planning",
        targetDate: goal.targetDate instanceof Date ? goal.targetDate.toISOString() : goal.targetDate,
        note: goal.note ?? undefined,
    };
}

export function parseGoalPayload(payload: any) {
    if (!payload || typeof payload !== "object") {
        return { error: "Invalid payload." };
    }

    const errors: string[] = [];

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const amountNumber = Number(payload.amount);
    const statusInput = typeof payload.status === "string" ? payload.status : "Planning";
    const targetDateInput = typeof payload.targetDate === "string" ? payload.targetDate : "";
    const note = typeof payload.note === "string" ? payload.note.trim() : undefined;

    if (!name) errors.push("Name is required.");
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) errors.push("Amount must be greater than zero.");

    const status: ParsedGoal["status"] =
        statusInput === "Active"
            ? "Active"
            : statusInput === "Completed"
                ? "Completed"
                : statusInput === "Paused"
                    ? "Paused"
                    : "Planning";

    let targetDate: Date | null = null;
    if (targetDateInput) {
        const parsed = new Date(targetDateInput);
        if (Number.isNaN(parsed.getTime())) errors.push("Target date must be valid.");
        else targetDate = parsed;
    }

    if (errors.length) return { error: errors.join(" ") };

    const parsed: ParsedGoal = {
        name,
        amount: new Prisma.Decimal(amountNumber),
        status,
        targetDate,
        note: note || null,
    };

    return { data: parsed };
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequestResponse(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
}

export function notFoundResponse(message = "Goal not found") {
    return NextResponse.json({ error: message }, { status: 404 });
}
