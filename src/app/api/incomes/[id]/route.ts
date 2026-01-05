import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    badRequestResponse,
    notFoundResponse,
    parseIncomePayload,
    resolveAuthenticatedUser,
    serializeIncome,
    unauthorizedResponse,
} from "../helpers";

type Params = { id: string };

export async function GET(_: Request, props: { params: Params }) {
    const { id } = props.params;
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const income = await prisma.income.findFirst({
        where: { id, userId: dbUser.id },
    });

    if (!income) return notFoundResponse();
    return NextResponse.json({ data: serializeIncome(income) });
}

export async function PATCH(request: Request, props: { params: Params }) {
    const { id } = props.params;
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const existing = await prisma.income.findFirst({
        where: { id, userId: dbUser.id },
    });
    if (!existing) return notFoundResponse();

    const payload = await request.json().catch(() => null);
    const { data, error } = parseIncomePayload(payload);
    if (error || !data) return badRequestResponse(error ?? "Invalid payload");

    const income = await prisma.income.update({
        where: { id },
        data: {
            ...data,
            recurrence: data.recurrence === "One-time" ? "ONE_TIME" : "RECURRING",
        },
    });

    return NextResponse.json({ data: serializeIncome(income) });
}

export async function DELETE(_: Request, props: { params: Params }) {
    const { id } = props.params;
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const existing = await prisma.income.findFirst({
        where: { id, userId: dbUser.id },
    });
    if (!existing) return notFoundResponse();

    await prisma.income.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
