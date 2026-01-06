import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    badRequestResponse,
    notFoundResponse,
    parseTransactionPayload,
    resolveAuthenticatedUser,
    serializeTransaction,
    unauthorizedResponse,
} from "../helpers";

type Params = { id?: string } | Promise<{ id?: string }>;

export async function GET(_: Request, props: { params: Params }) {
    const { id } = await Promise.resolve(props.params);
    if (!id) return badRequestResponse("Transaction id is required");

    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const txn = await prisma.transaction.findFirst({
        where: { id, userId: dbUser.id },
    });

    if (!txn) return notFoundResponse();
    return NextResponse.json({ data: serializeTransaction(txn) });
}

export async function PATCH(request: Request, props: { params: Params }) {
    const { id } = await Promise.resolve(props.params);
    if (!id) return badRequestResponse("Transaction id is required");

    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const existing = await prisma.transaction.findFirst({
        where: { id, userId: dbUser.id },
    });
    if (!existing) return notFoundResponse();

    const payload = await request.json().catch(() => null);
    const { data, error } = parseTransactionPayload(payload);
    if (error || !data) return badRequestResponse(error ?? "Invalid payload");

    const txn = await prisma.transaction.update({
        where: { id },
        data: {
            ...data,
            method: data.method ? data.method.toUpperCase() as any : undefined,
            status: data.status ? data.status.toUpperCase() as any : undefined,
        },
    });

    return NextResponse.json({ data: serializeTransaction(txn) });
}

export async function DELETE(_: Request, props: { params: Params }) {
    const { id } = await Promise.resolve(props.params);
    if (!id) return badRequestResponse("Transaction id is required");

    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return unauthorizedResponse();

    const existing = await prisma.transaction.findFirst({
        where: { id, userId: dbUser.id },
    });
    if (!existing) return notFoundResponse();

    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
