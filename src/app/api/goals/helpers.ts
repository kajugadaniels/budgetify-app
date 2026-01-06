import { GoalStatus, Prisma, type Goal } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoalRecord } from "@/components/shared/goals/types";

type ParsedGoal = {
    name: string;
    amount: Prisma.Decimal;
    status: GoalStatus;
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

const goalStatusLabels: Record<GoalStatus, GoalRecord["status"]> = {
    [GoalStatus.PLANNING]: "Planning",
    [GoalStatus.ACTIVE]: "Active",
    [GoalStatus.COMPLETED]: "Completed",
    [GoalStatus.PAUSED]: "Paused",
};

export function serializeGoal(goal: Goal): GoalRecord {
    return {
        id: goal.id,
        name: goal.name,
        amount: Number(goal.amount ?? 0),
        status: goalStatusLabels[goal.status],
        targetDate: goal.targetDate instanceof Date ? goal.targetDate.toISOString() : goal.targetDate,
        note: goal.note ?? undefined,
    };
}

export function parseGoalPayload(payload: unknown) {
    if (!payload || typeof payload !== "object") {
        return { error: "Invalid payload." };
    }

    const input = payload as Record<string, unknown>;
    const errors: string[] = [];

    const name = typeof input.name === "string" ? input.name.trim() : "";
    const amountNumber = Number(input.amount);
    const statusInput = typeof input.status === "string" ? input.status : "Planning";
    const targetDateInput = typeof input.targetDate === "string" ? input.targetDate : "";
    const note = typeof input.note === "string" ? input.note.trim() : undefined;

    if (!name) errors.push("Name is required.");
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) errors.push("Amount must be greater than zero.");

    const statusKey = statusInput.toLowerCase();
    const status: ParsedGoal["status"] =
        statusKey === "active"
            ? GoalStatus.ACTIVE
            : statusKey === "completed"
                ? GoalStatus.COMPLETED
                : statusKey === "paused"
                    ? GoalStatus.PAUSED
                    : GoalStatus.PLANNING;

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
