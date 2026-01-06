import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    badRequestResponse,
    parseIncomePayload,
    resolveAuthenticatedUser,
    serializeIncome,
    unauthorizedResponse,
} from "./helpers";

export async function GET() {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const incomes = await prisma.income.findMany({
        where: { userId: dbUser.id },
        orderBy: { nextPayout: "asc" },
    });

    return NextResponse.json({ data: incomes.map(serializeIncome) });
}

export async function POST(request: Request) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const payload = await request.json().catch(() => null);
    const { data, error } = parseIncomePayload(payload);
    if (error || !data) return badRequestResponse(error ?? "Invalid payload");

    const income = await prisma.income.create({
        data: {
            ...data,
            userId: dbUser.id,
        },
    });

    return NextResponse.json({ data: serializeIncome(income) }, { status: 201 });
}
