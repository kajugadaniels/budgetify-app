import { NextResponse } from "next/server";
import { Prisma, type Budget } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveAuthenticatedUser } from "../../incomes/helpers";

const mapBudget = (budget: Budget) => ({
    id: budget.id,
    name: budget.name,
    category: budget.category,
    amount: Number(budget.amount),
    spent: Number(budget.spent),
    month: budget.month,
    year: budget.year,
    note: budget.note ?? "",
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
});

type Params = {
    params: { id: string };
};

export async function GET(_: Request, { params }: Params) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const budget = await prisma.budget.findFirst({
        where: { id: params.id, userId: dbUser.id },
    });

    if (!budget) {
        return NextResponse.json({ error: "Budget not found." }, { status: 404 });
    }

    return NextResponse.json({ data: mapBudget(budget) });
}

export async function PATCH(req: Request, { params }: Params) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.budget.findFirst({
        where: { id: params.id, userId: dbUser.id },
    });
    if (!existing) {
        return NextResponse.json({ error: "Budget not found." }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const name = body?.name?.trim();
    const category = body?.category?.trim();
    const amount = body?.amount !== undefined ? Number(body.amount) : null;
    const spent = body?.spent !== undefined ? Number(body.spent) : null;
    const month = body?.month !== undefined ? Number(body.month) : null;
    const year = body?.year !== undefined ? Number(body.year) : null;
    const note = body?.note !== undefined ? body.note?.trim() : undefined;

    try {
        const budget = await prisma.budget.update({
            where: { id: params.id },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(category !== undefined ? { category } : {}),
                ...(amount !== null ? { amount: new Prisma.Decimal(amount) } : {}),
                ...(spent !== null ? { spent: new Prisma.Decimal(spent) } : {}),
                ...(month !== null ? { month } : {}),
                ...(year !== null ? { year } : {}),
                ...(note !== undefined ? { note } : {}),
            },
        });

        return NextResponse.json({ data: mapBudget(budget) });
    } catch (error: unknown) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "Budget with this name already exists for that period." },
                { status: 409 }
            );
        }

        console.error("Update budget failed", error);
        return NextResponse.json({ error: "Unable to update budget." }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: Params) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.budget.findFirst({
        where: { id: params.id, userId: dbUser.id },
    });
    if (!existing) {
        return NextResponse.json({ error: "Budget not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
        await tx.transaction.deleteMany({ where: { budgetId: params.id } });
        await tx.budget.delete({ where: { id: params.id } });
    });

    return NextResponse.json({ data: { id: params.id } });
}
