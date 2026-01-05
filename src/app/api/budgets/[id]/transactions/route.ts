import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveAuthenticatedUser } from "../../incomes/helpers";

type Params = { params: { id: string } };

const mapBudget = (budget: any) => ({
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

const mapTransaction = (txn: any) => ({
    id: txn.id,
    budgetId: txn.budgetId,
    name: txn.name,
    amount: Number(txn.amount),
    date: txn.date instanceof Date ? txn.date.toISOString() : txn.date,
    note: txn.note ?? "",
    createdAt: txn.createdAt,
    updatedAt: txn.updatedAt,
});

export async function GET(_: Request, { params }: Params) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const budget = await prisma.budget.findFirst({
        where: { id: params.id, userId: dbUser.id },
    });
    if (!budget) return NextResponse.json({ error: "Budget not found." }, { status: 404 });

    const transactions = await prisma.transaction.findMany({
        where: { budgetId: budget.id },
        orderBy: { date: "desc" },
    });

    return NextResponse.json({
        data: {
            budget: mapBudget(budget),
            transactions: transactions.map(mapTransaction),
        },
    });
}

export async function POST(req: Request, { params }: Params) {
    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const budget = await prisma.budget.findFirst({
        where: { id: params.id, userId: dbUser.id },
    });
    if (!budget) return NextResponse.json({ error: "Budget not found." }, { status: 404 });

    const body = await req.json().catch(() => null);
    const name = body?.name?.trim();
    const amountValue = body?.amount ? Number(body.amount) : null;
    const note = body?.note?.trim() || undefined;
    const dateInput = body?.date;

    if (!name || !amountValue || amountValue <= 0) {
        return NextResponse.json(
            { error: "Name and amount greater than zero are required." },
            { status: 400 }
        );
    }

    const parsedDate =
        typeof dateInput === "string" && dateInput.length
            ? new Date(dateInput)
            : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Invalid date provided." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
        const totals = await tx.transaction.aggregate({
            where: { budgetId: budget.id },
            _sum: { amount: true },
        });
        const currentSpent = Number(totals._sum.amount ?? 0);
        const nextSpent = currentSpent + amountValue;

        if (nextSpent > Number(budget.amount)) {
            throw new Prisma.PrismaClientKnownRequestError(
                "Budget limit exceeded",
                {
                    code: "P2001",
                    clientVersion: Prisma.prismaVersion.client,
                    meta: { max: Number(budget.amount), attempted: nextSpent },
                }
            );
        }

        const txn = await tx.transaction.create({
            data: {
                budgetId: budget.id,
                name,
                amount: new Prisma.Decimal(amountValue),
                date: parsedDate,
                note,
            },
        });

        const updatedBudget = await tx.budget.update({
            where: { id: budget.id },
            data: { spent: new Prisma.Decimal(nextSpent) },
        });

        return { txn, updatedBudget };
    });

    return NextResponse.json({
        data: {
            transaction: mapTransaction(result.txn),
            budget: mapBudget(result.updatedBudget),
        },
    });
}
