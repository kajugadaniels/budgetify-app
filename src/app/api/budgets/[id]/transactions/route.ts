import { NextResponse } from "next/server";
import { Prisma, type Budget, type Transaction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveAuthenticatedUser } from "../../../incomes/helpers";

type Params = { params: { id?: string } } | Promise<{ params: { id?: string } }>;

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

const mapTransaction = (txn: Transaction) => ({
    id: txn.id,
    budgetId: txn.budgetId ?? undefined,
    merchant: txn.merchant,
    category: txn.category,
    account: txn.account,
    method: txn.method === "CASH" ? "Cash" : txn.method === "TRANSFER" ? "Transfer" : txn.method === "MOBILE" ? "Mobile" : "Card",
    status: txn.status === "PENDING" ? "Pending" : txn.status === "FLAGGED" ? "Flagged" : "Cleared",
    amount: Number(txn.amount),
    date: txn.date instanceof Date ? txn.date.toISOString() : txn.date,
    note: txn.note ?? "",
    createdAt: txn.createdAt,
    updatedAt: txn.updatedAt,
});

export async function GET(_: Request, props: Params) {
    const { id } = await Promise.resolve(props.params);
    if (!id) return NextResponse.json({ error: "Budget id is required." }, { status: 400 });

    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const budget = await prisma.budget.findFirst({
        where: { id, userId: dbUser.id },
    });
    if (!budget) return NextResponse.json({ error: "Budget not found." }, { status: 404 });

    const transactions = await prisma.transaction.findMany({
        where: { budgetId: budget.id, userId: dbUser.id },
        orderBy: { date: "desc" },
    });

    return NextResponse.json({
        data: {
            budget: mapBudget(budget),
            transactions: transactions.map(mapTransaction),
        },
    });
}

export async function POST(req: Request, props: Params) {
    const { id } = await Promise.resolve(props.params);
    if (!id) return NextResponse.json({ error: "Budget id is required." }, { status: 400 });

    const dbUser = await resolveAuthenticatedUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const budget = await prisma.budget.findFirst({
        where: { id, userId: dbUser.id },
    });
    if (!budget) return NextResponse.json({ error: "Budget not found." }, { status: 404 });

    const body = await req.json().catch(() => null);
    const merchant = (body?.merchant ?? body?.name ?? "").toString().trim();
    const category = (body?.category ?? budget.category ?? "General").toString().trim();
    const account = (body?.account ?? "Budget account").toString().trim();
    const methodInput = (body?.method ?? "Card").toString();
    const statusInput = (body?.status ?? "Cleared").toString();
    const amountValue = body?.amount ? Number(body.amount) : null;
    const note = body?.note?.trim() || undefined;
    const dateInput = body?.date;

    const method =
        methodInput === "Cash"
            ? "CASH"
            : methodInput === "Transfer"
                ? "TRANSFER"
                : methodInput === "Mobile"
                    ? "MOBILE"
                    : "CARD";

    const status =
        statusInput === "Pending"
            ? "PENDING"
            : statusInput === "Flagged"
                ? "FLAGGED"
                : "CLEARED";

    if (!merchant || !category || !account || !amountValue || amountValue <= 0) {
        return NextResponse.json(
            { error: "Merchant, category, account, and a positive amount are required." },
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
            where: { budgetId: budget.id, userId: dbUser.id },
            _sum: { amount: true },
        });
        const currentSpent = Number(totals._sum.amount ?? 0);
        const nextSpent = currentSpent + amountValue;

        if (nextSpent > Number(budget.amount)) {
            throw new Prisma.PrismaClientKnownRequestError("Budget limit exceeded", {
                code: "P2001",
                clientVersion: Prisma.prismaVersion.client,
                meta: { max: Number(budget.amount), attempted: nextSpent },
            });
        }

        const txn = await tx.transaction.create({
            data: {
                userId: dbUser.id,
                budgetId: budget.id,
                merchant,
                category,
                account,
                method,
                status,
                amount: new Prisma.Decimal(amountValue),
                date: parsedDate,
                note,
                goalId: body?.addToGoal
                    ? (
                        await tx.goal.create({
                            data: {
                                userId: dbUser.id,
                                name: merchant,
                                amount: new Prisma.Decimal(amountValue),
                                status: "COMPLETED",
                                targetDate: parsedDate,
                                note,
                            },
                        })
                    ).id
                    : null,
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
