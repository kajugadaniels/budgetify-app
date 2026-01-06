import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    badRequestResponse,
    parseTransactionPayload,
    resolveAuthenticatedUser,
    serializeTransaction,
    unauthorizedResponse,
} from "./helpers";

export async function GET() {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const transactions = await prisma.transaction.findMany({
        where: { userId: dbUser.id },
        orderBy: { date: "desc" },
    });

    return NextResponse.json({ data: transactions.map(serializeTransaction) });
}

export async function POST(request: Request) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const payload = await request.json().catch(() => null);
    const { data, error } = parseTransactionPayload(payload);
    if (error || !data) return badRequestResponse(error ?? "Invalid payload");

    const txn = await prisma.transaction.create({
        data: {
            ...data,
            userId: dbUser.id,
            method: data.method ? data.method.toUpperCase() as any : undefined,
            status: data.status ? data.status.toUpperCase() as any : undefined,
        },
    });

    return NextResponse.json({ data: serializeTransaction(txn) }, { status: 201 });
}
