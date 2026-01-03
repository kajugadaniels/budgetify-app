import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function parseNumber(value: unknown) {
    const num = typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(num) ? num : null;
}

type Params = {
    params: { id: string };
};

export async function GET(_: Request, { params }: Params) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const income = await prisma.income.findFirst({
        where: { id: params.id, userId },
    });

    if (!income) {
        return NextResponse.json({ error: "Income not found." }, { status: 404 });
    }

    return NextResponse.json({
        id: income.id,
        amount: Number(income.amount),
        month: income.month,
        year: income.year,
        note: income.note,
        createdAt: income.createdAt,
        updatedAt: income.updatedAt,
    });
}

export async function PATCH(request: Request, { params }: Params) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const amount = body?.amount !== undefined ? parseNumber(body.amount) : null;
    const month = body?.month !== undefined ? parseNumber(body.month) : null;
    const year = body?.year !== undefined ? parseNumber(body.year) : null;
    const note =
        body?.note !== undefined && typeof body.note === "string"
            ? body.note.trim()
            : undefined;

    const income = await prisma.income.findFirst({
        where: { id: params.id, userId },
    });

    if (!income) {
        return NextResponse.json({ error: "Income not found." }, { status: 404 });
    }

    try {
        const updated = await prisma.income.update({
            where: { id: params.id },
            data: {
                ...(amount !== null ? { amount: new Prisma.Decimal(amount) } : {}),
                ...(month !== null ? { month } : {}),
                ...(year !== null ? { year } : {}),
                ...(note !== undefined ? { note } : {}),
            },
        });

        return NextResponse.json({
            id: updated.id,
            amount: Number(updated.amount),
            month: updated.month,
            year: updated.year,
            note: updated.note,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        });
    } catch (error: unknown) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "Income for this month and year already exists." },
                { status: 409 }
            );
        }

        console.error("Update income failed", error);
        return NextResponse.json(
            { error: "Unable to update income." },
            { status: 500 }
        );
    }
}
